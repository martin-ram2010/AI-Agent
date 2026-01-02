import { ConnectorAdapter, EntityDefinition } from '../../interfaces/adapter.types';
import * as jsforce from 'jsforce';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';

dotenv.config();

export class SalesforceAdapter implements ConnectorAdapter {
  
  private cachedConnection: jsforce.Connection | null = null;
  private tokenExpiry: number = 0;

  private async getConnection(): Promise<jsforce.Connection> {
    // 1. Check Cache
    if (this.cachedConnection && Date.now() < this.tokenExpiry) {
      console.log('[SalesforceAdapter] Reusing cached connection');
      return this.cachedConnection;
    }

    console.log('[SalesforceAdapter] Cache miss or expired. Initiating new login...');
    const loginUrl = process.env.SF_LOGIN_URL || 'https://login.salesforce.com';
    const tokenEndpoint = `${loginUrl}/services/oauth2/token`;
    const clientId = process.env.SF_CLIENT_ID;
    const username = process.env.SF_USERNAME;
    const privateKeyPath = process.env.SF_PRIVATE_KEY_PATH;

    if (!clientId || !username || !privateKeyPath) {
      throw new Error('Missing Salesforce configuration (SF_CLIENT_ID, SF_USERNAME, or SF_PRIVATE_KEY_PATH)');
    }

    // Read private key using fs
    let privateKey = '';
    try {
      privateKey = fs.readFileSync(path.resolve(privateKeyPath), 'utf8');
    } catch (error: any) {
        throw new Error(`Failed to read private key at ${privateKeyPath}: ${error.message}`);
    }

    // Create JWT claims
    const claims = {
      iss: clientId,
      sub: username,
      aud: loginUrl,
      exp: Math.floor(Date.now() / 1000) + 300 // 5 minutes exp for the assertion itself
    };

    // Sign JWT
    let assertion = '';
    try {
      // @ts-ignore - jsonwebtoken types might clash with strict mode if not exact, ignoring for now
      assertion = jwt.sign(claims, privateKey, { algorithm: 'RS256' });
    } catch (error: any) {
      throw new Error(`JWT signing failed: ${error.message}`);
    }

    // Exchange JWT for Token
    try {
      console.log('[SalesforceAdapter] Exchanging JWT for access token...');
      const params = new URLSearchParams();
      params.append('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
      params.append('assertion', assertion);

      const response = await axios.post(tokenEndpoint, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const { access_token, instance_url } = response.data;
      console.log('[SalesforceAdapter] Authentication Successful. Instance:', instance_url);

      // Cache the connection (Safety: set expiry to 1 hour, standard is 2h but 1h is safer)
      this.tokenExpiry = Date.now() + (3600 * 1000); 
      this.cachedConnection = new jsforce.Connection({
        accessToken: access_token,
        instanceUrl: instance_url
      });

      return this.cachedConnection;

    } catch (error: any) {
      console.error('[SalesforceAdapter] JWT Auth Failed:', error.response?.data || error.message);
      throw new Error('Salesforce Authentication Failed: ' + (JSON.stringify(error.response?.data) || error.message));
    }
  }

  public async describeEntity(entityName: string): Promise<EntityDefinition> {
    console.log(`[SalesforceAdapter] Describing ${entityName}`);
    const conn = await this.getConnection();

    try {
        const describeResult = await conn.describe(entityName);
        console.log(`[SalesforceAdapter] Describe Result:`, JSON.stringify(describeResult));
        // Map Salesforce Describe fields to our simple EntityDefinition
        const fields = describeResult.fields.map((f: any) => ({
            name: f.name,
            label: f.label,
            type: f.type,
            nillable: f.nillable
        }));

        return {
            name: describeResult.name,
            label: describeResult.label,
            fields: fields
        };
    } catch (err: any) {
         console.error(`[SalesforceAdapter] Describe Error for ${entityName}:`, err);
         throw new Error(`Failed to describe entity ${entityName}: ${err.message}`);
    }
  }

  public async executeQuery(query: string): Promise<any[]> {
    console.log(`[SalesforceAdapter] Executing SOQL: ${query}`);
    const conn = await this.getConnection();

    try {
        const result = await conn.query(query);
        return result.records;
    } catch (err: any) {
        console.error(`[SalesforceAdapter] Query Error:`, err);
        throw new Error(`Failed to execute SOQL query: ${err.message}`);
    }
  }
  public async updateEntity(entityName: string, id: string, data: any): Promise<any> {
    console.log(`[SalesforceAdapter] Updating ${entityName} record: ${id}`);
    const conn = await this.getConnection();

    try {
        const result = (await conn.sobject(entityName).update({
            Id: id,
            ...data
        })) as any;

        if (Array.isArray(result)) {
             // For bulk or unexpected array response
             const first = result[0];
             if (!first.success) throw new Error(`Salesforce update failed: ${JSON.stringify(first.errors)}`);
             return first;
        }

        if (!result.success) {
            throw new Error(`Salesforce update failed: ${JSON.stringify(result.errors)}`);
        }

        return result;
    } catch (err: any) {
        console.error(`[SalesforceAdapter] Update Error:`, err);
        throw new Error(`Failed to update ${entityName}: ${err.message}`);
    }
  }
}

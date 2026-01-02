import { ConnectorAdapter, OrgConfig } from '../interfaces/adapter.types';
import { SalesforceAdapter } from './adapters/salesforce.adapter';

export class AdapterFactory {
  
  public static createAdapter(config: OrgConfig): ConnectorAdapter {
    switch (config.system) {
      case 'salesforce':
        console.log('[AdapterFactory] Creating SalesforceAdapter');
        return new SalesforceAdapter();
      case 'servicenow':
        throw new Error('ServiceNow adapter not implemented');
      default:
        throw new Error(`Unsupported system: ${config.system}`);
    }
  }
}

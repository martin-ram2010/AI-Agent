export interface EntityField {
  name: string;
  label: string;
  type: string;
  nillable: boolean;
}

export interface EntityDefinition {
  name: string;
  label: string;
  fields: EntityField[];
}

export interface ConnectorAdapter {
  /**
   * Describes the schema of a specific entity (e.g. 'Account')
   */
  describeEntity(entityName: string): Promise<EntityDefinition>;

  /**
   * Executes a query in the target system's language (e.g. SOQL).
   */
  executeQuery(query: string): Promise<any[]>;

  /**
   * Updates a specific record in the target system.
   */
  updateEntity(entityName: string, id: string, data: any): Promise<any>;
}

export interface OrgConfig {
  system: 'salesforce' | 'servicenow' | 'sap';
  connectionParams: Record<string, any>; // url, token, etc.
}

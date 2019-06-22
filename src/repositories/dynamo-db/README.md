# Feature Toggle Node.js with DynamoDB

## Configuration

* Table Name: `feature-toggles`
* Primary Key / Parition Key: `paritionKey`
* Indexes: 
    * `tenantId-key-index`
        * Parition Key: `tenantId`
        * Sort Key: `key`



import * as aws from "aws-sdk";

export abstract class DynamoDbRepository<T> {
    protected client: aws.DynamoDB.DocumentClient;

    constructor(protected tableName: string) {
        this.client = new aws.DynamoDB.DocumentClient({
            endpoint: "http://localhost:4569",
            region: "ap-southeast-2"
        });
    }

    abstract toDomainObject(dataObject: any): T;
    abstract toDataObject(domainObject: T): any;

    save(model: T): Promise<void> {
        return new Promise((resolve, reject) => {
            const params: aws.DynamoDB.DocumentClient.PutItemInput = {
                TableName: this.tableName,
                Item: this.toDataObject(model)
            };
            this.client.put(params, () => {
                resolve();
            });
        });
    }

    get(id): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const params: aws.DynamoDB.DocumentClient.GetItemInput = {
                TableName: this.tableName,
                Key: {
                    id: id
                }
            };
            this.client.get(params, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    if (result.Item) {
                        let item = this.toDomainObject(result.Item);
                        resolve(item);
                    } else {
                        resolve(null);
                    }
                }
            });
        });
    }

    delete(id): Promise<void> {
        return new Promise((resolve, reject) => {
            const params: aws.DynamoDB.DocumentClient.DeleteItemInput = {
                TableName: this.tableName,
                Key: {
                    id: id
                }
            };
            this.client.delete(params, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }
}

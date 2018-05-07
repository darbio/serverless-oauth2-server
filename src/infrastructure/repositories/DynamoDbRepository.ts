import * as aws from "aws-sdk";
import * as crypto from "crypto";

export abstract class DynamoDbRepository<T> {
    protected client: aws.DynamoDB.DocumentClient;

    constructor(protected tableName: string) {
        let dynamoOptions = undefined;
        if (!!process.env.IS_OFFLINE) {
            dynamoOptions = {
                endpoint: "http://localhost:4569",
                region: "ap-southeast-2"
            };
        }
        this.client = new aws.DynamoDB.DocumentClient(dynamoOptions);
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

    protected encrypt(unencrypted?: string): string {
        if (!unencrypted) {
            return null;
        }

        let algorithm = "aes256";
        let key = process.env.DB_ENCRYPTION_KEY;

        let cipher = crypto.createCipher(algorithm, key);
        let encrypted =
            cipher.update(unencrypted, "utf8", "hex") + cipher.final("hex");

        return encrypted;
    }

    protected decrypt(encrypted?: string): string {
        if (!encrypted) {
            return null;
        }

        let algorithm = "aes256";
        let key = process.env.DB_ENCRYPTION_KEY;

        let decipher = crypto.createDecipher(algorithm, key);
        let decrypted =
            decipher.update(encrypted, "hex", "utf8") + decipher.final("utf8");

        return decrypted;
    }
}

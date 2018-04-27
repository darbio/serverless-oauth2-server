import * as aws from 'aws-sdk';

export class DynamoDyRepository<T> {
    private client: aws.DynamoDB.DocumentClient

    constructor(private tableName: string) {
        this.client = new aws.DynamoDB.DocumentClient({
            endpoint: 'http://localhost:4569',
            region: 'ap-southeast-2'
        })
    }

    save(model: T): Promise<void> {
        return new Promise((resolve, reject) => {
            const params: aws.DynamoDB.DocumentClient.PutItemInput = {
                TableName: this.tableName,
                Item: model
            }
            this.client.put(params, () => {
                resolve()
            })
        })
        
    }

    get(id): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const params: aws.DynamoDB.DocumentClient.GetItemInput = {
                TableName: this.tableName,
                Key: {
                    id: id
                }
            }
            this.client.get(params, (error, result) => {
                if (error) {
                    reject(error)
                }
                else {
                    resolve(result.Item as T)
                }
            })
        })
    }
}
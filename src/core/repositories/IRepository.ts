export interface ISave<T> {
    save(entity: T): Promise<void>
}

export interface IGet<T, TId> {
    get(id: TId): Promise<T>
}
export interface save<T> {
    save(entity: T): Promise<void>
}

export interface get<T, TId> {
    get(id: TId): Promise<T>
}
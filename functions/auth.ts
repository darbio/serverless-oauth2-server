export class handler {
    token(event: any, context: any, callback: any): void {
      callback(undefined, {
        message: `Method: ${event.method}, Param: ${event.query.foo}`,
        event: event
      });
    };
}
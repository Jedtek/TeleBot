class TelegramHTTPServer {
    fastify: null = null;
    hostname: string;
    port: number;

    constructor(host: string, port: number) {
        this.port = port;
        this.hostname = host;
    }

   /* async _handler(req: HttpRequest) {  // 1. Write the handler as a function that returns response
        return OK({ body: "Hello world!" });
    }

    async runServer(): Promise<boolean> {
        this.server = http.createServer(
            toNodeRequestListener(this._handler)            // 2. Connect the handler to the node.js server
        );

        this.server.listen(this.port, this.hostname, () => {       // 3. Start your node server as you were before
            console.log(`Server running at http://${this.hostname}:${this.port}/`);
        });

        return true;
    }*/
}

export default TelegramHTTPServer;
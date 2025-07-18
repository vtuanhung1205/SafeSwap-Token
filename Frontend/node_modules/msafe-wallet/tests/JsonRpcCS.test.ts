import { Connector } from "../src/connector";
import { JsonRPCServer } from "../src/JsonRPCServer";
import { JsonRPCClient } from "../src/JsonRPCClient";


describe("Connector test", () => {
    const requestName = "ping";
    const requestData = "anything";
    const requestDataWrong = "wrong";
    const notificationName = "sthChange";
    const notificationData = "something";
    const channel = new MessageChannel();
    const server = new JsonRPCServer(new Connector(channel.port1, undefined, undefined), {
        [requestName]: async (data: string) => {
            if (data !== requestData) throw data;
            return "pong";
        }
    });
    const client = new JsonRPCClient(new Connector(channel.port2, undefined, undefined), {
        [notificationName]: async (data: string) => {
            expect(data).toEqual(notificationData);
        }
    });

    afterAll(() => {
        server.connector.close();
        client.connector.close();
    });

    it("ping-pong", async () => {
        const result = await client.request(requestName, [requestData]);
        expect(result).toEqual("pong");
    })

    it("notification", async () => {
        await server.notify(notificationName, [notificationData]);
    })

    it("request error", async () => {
        await expect(client.request(requestName, [requestDataWrong])).rejects.toEqual(requestDataWrong);
    });

    it("request not exist", async () => {
        await expect(client.request("notExist", [])).rejects.toEqual("method not exist");
    });

});

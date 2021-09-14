// with { "type": "module" } in your package.json
import { createServer } from 'http';
import { io as Client } from 'socket.io-client';
import { Server } from 'socket.io';
import { assert } from 'chai';

describe('Sockets', () => {
  let io, serverSocket, clientSocket;
  const port = 4000;

  before(done => {
    const httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(port, () => {
      clientSocket = Client(`http://localhost:${port}`);
      io.on('connection', socket => {
        serverSocket = socket;
      });
      clientSocket.on('connect', done);
    });
  });

  after(() => {
    io.close();
    clientSocket.close();
  });

  it('should work', done => {
    clientSocket.on('hello', arg => {
      assert.equal(arg, 'world');
      done();
    });
    serverSocket.emit('hello', 'world');
  });

  it('should work (with ack)', done => {
    serverSocket.on('hi', cb => {
      cb('hola');
    });
    clientSocket.emit('hi', arg => {
      assert.equal(arg, 'hola');
      done();
    });
  });
});

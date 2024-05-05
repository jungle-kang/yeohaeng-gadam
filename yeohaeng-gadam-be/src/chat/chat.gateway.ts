import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  users = {};
  socketToRoom = {};

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
  }

  // user가 연결이 끊겼을 때 처리
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // disconnect한 user가 포함된 roomID
    const roomID = this.socketToRoom[client.id];
    // room에 포함된 유저
    let room = this.users[roomID];
    if (room) {
      // disconnect user를 제외
      room = room.filter(user => user.id !== client.id);
      this.users[roomID] = room;
      if (room.length === 0) {
        delete this.users[roomID];
        return;
      }
    }
    // client.broadcast.to(roomID).emit("user_exit", { id: client.id });
    client.to(roomID).emit("user_exit", { id: client.id });
    // console.log(this.users);
  }

  @SubscribeMessage('join_room')
  // async handleJoinRoom(client: Socket, data: any) {
  handleJoinRoom(
    @MessageBody() data: { room: string; email: string },
    @ConnectedSocket() client: Socket,
  ) {
    // user[room]에는 room에 있는 사용자들이 배열 형태로 저장된다.
    // room이 존재한다면
    if (this.users[data.room]) {
      const length = this.users[data.room].length;
      if (length === 5) {
        client.to(client.id).emit("room_full");
        return;
      }
      // 인원이 최대 인원보다 적으면 접속 가능
      this.users[data.room].push({ id: client.id, email: data.email });
    } else {
      // room이 존재하지 않는다면 새로 생성
      this.users[data.room] = [{ id: client.id, email: data.email }];
    }
    // 해당 소켓이 어느 room에 속해있는 지 알기 위해 저장
    this.socketToRoom[client.id] = data.room;

    client.join(data.room);
    console.log(`[${this.socketToRoom[client.id]}]: ${client.id} enter`);

    const usersInThisRoom = this.users[data.room].filter(user => user.id !== client.id);
    console.log(usersInThisRoom);

    // 본인에게 해당 user array를 전송
    // 새로 접속하는 user가 이미 방에 있는 user들에게 offer(signal)를 보내기 위해
    // client.emit("all_users", usersInThisRoom);
    this.server.to(client.id).emit('all_users', usersInThisRoom);
  }

  // 다른 user들에게 offer를 보냄 (자신의 RTCSessionDescription)
  @SubscribeMessage('offer')
  // handleOffer(client: Socket, sdp: any) {
  //   console.log("offer: " + client.id);
  //   client.broadcast.emit("getOffer", sdp);
  // }
  handleOffer(
    @MessageBody()
    data: {
      offerReceiveID: string;
      sdp: string;
      offerSendID: string;
      offerSendEmail: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    console.log("offer: " + client.id);
    client.to(data.offerReceiveID).emit('getOffer', {
      sdp: data.sdp,
      offerSendID: data.offerSendID,
      offerSendEmail: data.offerSendEmail,
    });
  }

  // offer를 보낸 user에게 answer을 보냄 (자신의 RTCSessionDescription)
  @SubscribeMessage('answer')
  // handleAnswer(client: Socket, sdp: any) {
  //   console.log("answer: " + client.id);
  //   client.broadcast.emit("getAnswer", sdp);
  // }
  handleAnswer(
    @MessageBody()
    data: {
      answerReceiveID: string;
      sdp: string;
      answerSendID: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    console.log("answer: " + client.id);
    client.to(data.answerReceiveID).emit('getAnswer', {
      sdp: data.sdp,
      answerSendID: data.answerSendID,
    });
  }

  // 자신의 ICECandidate 정보를 signal(offer 또는 answer)을 주고 받은 상대에게 전달
  @SubscribeMessage('candidate')
  // handleCandidate(client: Socket, candidate: any) {
  //   console.log("candidate: " + client.id);
  //   client.broadcast.emit("getCandidate", candidate);
  // }
  handleCandidate(
    @MessageBody()
    data: {
      candidateReceiveID: string;
      candidate: string;
      candidateSendID: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    console.log("candidate: " + client.id);
    client.to(data.candidateReceiveID).emit('getCandidate', {
      candidate: data.candidate,
      candidateSendID: data.candidateSendID,
    });
  }
}


// @SubscribeMessage('join_room')
// async joinRoom(
//   @MessageBody() roomName: string,
//   @ConnectedSocket() socket: Socket,
// ) {
//   const room = this.server.in(roomName);

//   const roomSockets = await room.fetchSockets();
//   const numberOfPeopleInRoom = roomSockets.length;

//   // Log the room joining activity
//   console.log(`Socket ${socket.id} joining room: ${roomName}, count: ${numberOfPeopleInRoom}`);

//   // // Limit to 2 people in a room
//   // if (numberOfPeopleInRoom > 1) {
//   //   room.emit('too_many_people');
//   //   console.log(`Room ${roomName} is full`);
//   //   return;
//   // }

//   // if (numberOfPeopleInRoom === 1) {
//   //   room.emit('another_person_ready');
//   //   console.log(`Room ${roomName} has another person ready`);
//   // }

//   socket.join(roomName);
// }

// @SubscribeMessage('send_connection_offer')
// async sendConnectionOffer(
//   @MessageBody()
//   {
//     offer,
//     roomName,
//   }: {
//     offer: RTCSessionDescriptionInit;
//     roomName: string;
//   },
//   @ConnectedSocket() socket: Socket,
// ) {
//   console.log(`Socket ${socket.id} sending offer to room: ${roomName}`);
//   this.server.in(roomName).except(socket.id).emit('send_connection_offer', {
//     offer,
//     roomName,
//   });
// }

// @SubscribeMessage('answer')
// async answer(
//   @MessageBody()
//   {
//     answer,
//     roomName,
//   }: {
//     answer: RTCSessionDescriptionInit;
//     roomName: string;
//   },
//   @ConnectedSocket() socket: Socket,
// ) {
//   console.log(`Socket ${socket.id} sending answer to room: ${roomName}`);
//   this.server.in(roomName).except(socket.id).emit('answer', {
//     answer,
//     roomName,
//   });
// }
//   @SubscribeMessage('join_room')
//   handleJoinRoom(client: Socket, roomName: string): void {
//     client.join(roomName);
//     console.log(`Socket ${client.id} joining room: ${roomName}`);
//     this.server.to(roomName).emit('welcome');
//   }

//   @SubscribeMessage('offer')
//   handleOffer(client: Socket, { offer, roomName }): void {
//     console.log(`Socket ${client.id} sending offer to room: ${roomName}`);
//     client.to(roomName).emit('offer', offer);
//   }

//   @SubscribeMessage('answer')
//   handleAnswer(client: Socket, { answer, roomName }): void {
//     console.log(`Socket ${client.id} sending answer to room: ${roomName}`);
//     client.to(roomName).emit('answer', answer);
//   }
// }


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
        console.log("no users in the room, deleted the room");
        return;
      }
    }
    // client.broadcast.to(roomID).emit("user_exit", { id: client.id });
    client.to(roomID).emit("user_exit", { id: client.id });
    console.log("users left in the room: ", this.users);
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
        console.log("already 5 users in the room");
        return;
      }
      // 인원이 최대 인원보다 적으면 접속 가능
      this.users[data.room].push({ id: client.id, email: data.email });
      console.log("pushed user to the room");
    } else {
      // room이 존재하지 않는다면 새로 생성
      this.users[data.room] = [{ id: client.id, email: data.email }];
      console.log("created new room");
    }
    // 해당 소켓이 어느 room에 속해있는 지 알기 위해 저장
    this.socketToRoom[client.id] = data.room;

    client.join(data.room);
    console.log(`[${this.socketToRoom[client.id]}]: ${client.id} enter`);

    const usersInThisRoom = this.users[data.room].filter(user => user.id !== client.id);
    console.log("users in this room: ", usersInThisRoom);

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
      // sdp: string;
      sdp: any;
      offerSendID: string;
      offerSendEmail: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    console.log("offer socket id: " + client.id);
    console.log("offer: offerReceiveID" + data.offerReceiveID);
    console.log("offer sdp: " + data.sdp);
    console.log("offer offerSendID: " + data.offerSendID);
    console.log("offer offerSendEmail: " + data.offerSendEmail);
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
      sdp: any;
      answerSendID: string;
      answerReceiveID: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    console.log("received answer sdp: " + data.sdp);
    console.log("received answerSendID: " + data.answerSendID);
    console.log("received answerRID: " + data.answerReceiveID);
    console.log("received socketID: " + client.id);
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

//   @WebSocketServer()
//   server: Server;
//   users = {};
//   socketToRoom = {};

//   handleConnection(client: Socket, ...args: any[]) {
//     console.log(`Client connected: ${client.id}`);
//   }

//   // user가 연결이 끊겼을 때 처리
//   handleDisconnect(client: Socket) {
//     console.log(`Client disconnected: ${client.id}`);
//     // disconnect한 user가 포함된 roomID
//     const roomID = this.socketToRoom[client.id];
//     // room에 포함된 유저
//     let room = this.users[roomID];
//     if (room) {
//       // disconnect user를 제외
//       room = room.filter(user => user.id !== client.id);
//       this.users[roomID] = room;
//     }
//     client.broadcast.to(roomID).emit("user_exit", { id: client.id });
//     // console.log(this.users);
//   }

//   @SubscribeMessage('join_room')
//   async handleJoinRoom(client: Socket, data: any) {
//     // user[room]에는 room에 있는 사용자들이 배열 형태로 저장된다.
//     // room이 존재한다면
//     if (this.users[data.room]) {
//       const length = this.users[data.room].length;
//       if (length === 5) {
//         client.emit("room_full");
//         return;
//       }
//       // 인원이 최대 인원보다 적으면 접속 가능
//       this.users[data.room].push({ id: client.id, email: data.email });
//     } else {
//       // room이 존재하지 않는다면 새로 생성
//       this.users[data.room] = [{ id: client.id, email: data.email }];
//     }
//     // 해당 소켓이 어느 room에 속해있는 지 알기 위해 저장
//     this.socketToRoom[client.id] = data.room;

//     client.join(data.room);
//     console.log(`[${this.socketToRoom[client.id]}]: ${client.id} enter`);

//     const usersInThisRoom = this.users[data.room].filter(user => user.id !== client.id);
//     console.log(usersInThisRoom);

//     // 본인에게 해당 user array를 전송
//     // 새로 접속하는 user가 이미 방에 있는 user들에게 offer(signal)를 보내기 위해
//     client.emit("all_users", usersInThisRoom);
//   }

//   // 다른 user들에게 offer를 보냄 (자신의 RTCSessionDescription)
//   @SubscribeMessage('offer')
//   handleOffer(client: Socket, sdp: any) {
//     console.log("offer: " + client.id);
//     client.broadcast.emit("getOffer", sdp);
//   }

//   // offer를 보낸 user에게 answer을 보냄 (자신의 RTCSessionDescription)
//   @SubscribeMessage('answer')
//   handleAnswer(client: Socket, sdp: any) {
//     console.log("answer: " + client.id);
//     client.broadcast.emit("getAnswer", sdp);
//   }

//   // 자신의 ICECandidate 정보를 signal(offer 또는 answer)을 주고 받은 상대에게 전달
//   @SubscribeMessage('candidate')
//   handleCandidate(client: Socket, candidate: any) {
//     console.log("candidate: " + client.id);
//     client.broadcast.emit("getCandidate", candidate);
//   }
// }




var app=require("express")();
var http=require("http").Server(app);
var io=require('socket.io')(http);
app.get("/",function(req,res){
    res.sendFile(__dirname+"/index.html")
})
let userNum=1;
// let users={accnum:{username,password,socketId}}
let users={}
io.on('connection',function(socket){
    io.emit('users',userNum)
    console.log('connected');
    // console.log(socket);
    // console.log(socket.id);
//指定用户聊天   io.to(socket.id).emit('message','surprise');
    
    socket.on('disconnect',function(){
        console.log('user disconnectioned');
    })
    socket.on("login",function(data){
        let datas={code:1,msg:"用户不存在！"}
        Object.keys(users).forEach(function(key){
            if(users[key]["username"]==data.loginname||users[key]["accnum"]==data.loginname){
                if(users[key]["password"]==data.loginpsw){
                    datas={
                        code:200,
                        msg:"登录成功！"
                    }
                }else{
                    datas={
                        code:1,
                        msg:"密码错误！"
                    }
                }
            }
       });
       io.emit("login",datas)
    })
    socket.on('register',function(data){
        // console.log(data);
//         accnum: "admin"
// introduce: "sdffdf"
// password: "sdf"
// username: "admin"
let datas={}
        // console.log(data.accnum.length,data.introduce.length,data.password.length,data.username.length);
        if(data.accnum.length<5||data.password.length<5||data.username.length<5){
           datas={
               code:1,
               msg:"账号不符合要求"
           } 
        }else{
            datas={
                code:200,
                msg:"注册成功"
            }
            if(data.accnum in users){
                datas={code:1,
                msg:"账号已存在"}
            }
            Object.keys(users).forEach(function(key){
                if(users[key]["username"]==data.username){
                    datas={code:1,msg:"用户名已存在"}
                }
           });
           if(datas.code==200){
            users[data.accnum]={socketId:socket.id,accnum:data.accnum,introduce:data.introduce,password:data.password,username:data.username}
           }
        }
        // console.log(datas,users);
        io.emit("register",datas)
    })
    socket.on('users',function(msg){
        console.log(userNum+" user connection");
        io.emit('some event',{for:'everyone'});
        io.emit('users',userNum)
    })
    socket.on('chat',function(msg){
        //emit发送给所有人
        io.emit('chat',msg);
        //发送给指定用户socket.broadcast.emit('hi');
    })
    userNum++;
});
let port=3001;
http.listen(port,function(){
console.log(`listen on *:${port}`);
})
http.on('error',err=>{
    console.log(err);
    if(err.code=='EADDRINUSE'){
        http.listen(++port)
    }
    
})
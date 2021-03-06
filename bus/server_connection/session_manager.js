'use strict'
const fs = require("fs");


const length_key = 10;

class SessionsManager{
    
    constructor(size, path){
        if(!size){
            this.size = 0;
        }else{
            this.size = size;
        }
        this.timeout = 1000000;
        this.connections = [];
        this.path_data = path;
    }

    // Nếu tồn tại key trả về index của session
    isExistedKey(key){
        var length = this.connections.length;
        for(var i = 0; i <length; i++){
            if(key === this.connections[i].sessionID){
                return i;
            }
        }
        return -1;
    }

    // Kiểm tra session còn thời hạn không? Nếu không return true, ngược lại false
    isExpiredDate(last_access, a_timeout){
        var milis = new Date(last_access).getTime();
        var milisNow = new Date().getTime();
        return (milis + a_timeout) < milisNow;
    }

    // Tạo một key sessionID random
    createSessionKey(size){
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < size; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }

    // Tạo một session mới, đồng thời cập nhật dữ liệu xuống file
    insertNewConnection(username, type){
        if(this.connections.length === this.size){
            return -1;
        }
        var i = 0;
        while(true){
            i++;
            if(i == 100){
                return -1;
            }
            var key = this.createSessionKey(length_key);
            if(this.isExistedKey(key) < 0){
                var new_session = {"sessionID" : key, "time_out" : this.timeout, "last_access" : new Date(), "username" : username, "type" : type};
                this.connections.push(new_session);
                this.saveDataToFile();
                return key;
            }
        }
    }

    // In ra các session đang quản lý
    printConnections(){   
        this.connections.forEach(function(value){
            console.log(value);
        });
    }

    // Lưu các connections hiện tại xuống dưới file
    saveDataToFile(){
        fs.writeFileSync(this.path_data, JSON.stringify(this.connections), "utf8");
    }

    // Cập nhật các connections từ file
    loadDataFromFile(){
        try{
            var session_data = JSON.parse(fs.readFileSync(this.path_data, 'utf8'));
            this.connections = [];
            var length = session_data.length;
            for(var i = 0; i < length; i++){
                var session = session_data[i];
                if(!this.isExpiredDate(session.last_access, session.time_out)){
                    this.connections.push(session);
                }
            }
        }catch(err){
            console.log(err);
        }     
    }

    // Set timeout cho session_manager
    setTimeout(a_timeout){
        this.timeout = a_timeout;
    }

    // Trả về thời gian timeout hiện tại của session_manager
    getTimeout(){
        return this.timeout;
    }

    // Cập nhật thời gian truy cập mới nhất cho session, thành công thì trả true, cập nhật file.
    // Ngược lại return false.
    updateSessionLastAccessDate(sessionID, new_access_date){
        var newDate = new Date(new_access_date);
        if(newDate == undefined) return false;
        var length = this.connections.length;
        for(var i =0; i<length; i++){
            var session = this.connections[i];
            if(sessionID == session.sessionID){
                if(!this.isExpiredDate(session.last_access, session.time_out)){
                    session.last_access = new_access_date;
                    this.saveDataToFile();
                    return true;
                }
            }
        }
        return false;
    }

    // Xoá session tại vị trí index
    removeSession(index){
        if(index < 0 || index > this.connections.length) return false;
        this.connections.splice(index, 1);
        this.saveDataToFile();
        return true;
    }

    // Lấy session tại vị trí index
    getSesionAt(index){
        if(index < 0 || index >= this.connections.length) return -1;
        return this.connections[index];
    }

    // Error Expired Session
    getExpiredError(){
        return {"error" : "Your Session is Expired!"};
    }

    // Error Login Account
    getLoginError(){
        return {"error" : "Your Account is not valid!"};
    }

    // getField at session index
    getField(index, field){
        if(index < 0 || index >= this.connections.length) return -1;
        var objData = this.connections[index];
        var value = objData[`${field}`];
        if(value == undefined){
            return -1;
        }
        return value;
    }
    
    // set value for field at session index
    setField(index, field, value){
        if(index < 0 || index >= this.connections.length) return -1;
        var objData = this.connections[index];
        objData[`${field}`] = value;
        this.saveDataToFile();
    }

    // update field last_access at session index
    updateNewLastAccessAt(index){
        if(index < 0 || index >= this.connections.length) return -1;
        this.connections[index].last_access = new Date();
        this.saveDataToFile();
        return 1;
    }
}

module.exports = SessionsManager;
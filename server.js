const readline = require("readline");
const io = require("socket.io")();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const authenticate = {
    username: "box",
    password: "123",
};

const messages = [];
let sockets = [];

const colorR = "\x1b[0;31m";

// Gửi tin nhắn từ terminal đến client
const askUser = () => {
    rl.on("line", (input) => {
        const newMessage = {
            id: `${colorR}` + "[Admin]" + `${colorR}`,
            message: input,
        };
        messages.push(newMessage);
        //  send all messages for all users .
        sockets.forEach((user) => {
            user.emit("messages", messages);
        });
    });
};

// Lắng nghe kết nối từ client
io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);
    sockets.push(socket);

    // Nhận tên và mật khẩu từ client
    socket.on("credentials", (credentials) => {
        if (
            authenticate.username != credentials.username ||
            authenticate.password != credentials.password
        )
            socket.emit("credentials", false);
        else socket.emit("credentials", true);
    });

    // Nhận tin nhắn từ client và hiển thị trên terminal
    socket.on("messages", (message) => {
        messages.push({ id: socket.id, message: message });

        //  send all messages for all users .
        sockets.forEach((user) => {
            user.emit("messages", messages);
        });
    });

    askUser();

    // Ngắt kết nối khi client disconnects
    socket.on("disconnect", () => {
        sockets = sockets.filter((item) => item.id !== socket.id);
        console.log(`Client disconnected: ${socket.id}`);
    });
});

// Lắng nghe kết nối từ cổng 3000
io.listen(3000, () => {
    console.log("Server is listening on port 3000");
});

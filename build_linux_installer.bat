docker build -t electron-linux-builder .

docker run -v "C:/Users/29853/Desktop/PolyQuery/release:/app/release" electron-linux-builder
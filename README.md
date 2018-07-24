# Luận văn thạc sĩ: Nguyễn Ngọc Khánh
Tên đề tài: Nghiên cứu cơ chế an toàn trong công nghệ Blockchain

# Các bước cài đặt:

Bước 1: Chạy script prereqs-ubuntu.sh để chuẩn bị môi trường:

./prereqs-ubuntu.sh

Bước 2: Cài đặt nodejs

curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -

apt-get install -y nodejs

Bước 3: Thực hiện chạy theo chương trình

cd fabbanhk

./startFabric.sh

Bước 4: Khởi động API

node server.js

End.

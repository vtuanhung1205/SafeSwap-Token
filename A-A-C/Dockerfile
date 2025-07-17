# Bước 1: Chọn một ảnh nền Python nhẹ và ổn định
FROM python:3.11-slim

# Bước 2: Cài đặt các công cụ build hệ thống
# Đây là bước quan trọng để biên dịch các thư viện như pandas, numpy, scikit-learn
# Nó sẽ sửa lỗi "metadata-generation-failed" của bạn
RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

# Bước 3: Đặt thư mục làm việc bên trong container
WORKDIR /app

# Bước 4: Tối ưu hóa cache của Docker
# Sao chép chỉ file requirements.txt trước và cài đặt các thư viện.
# Nếu bạn chỉ thay đổi code .py mà không thay đổi thư viện, Docker sẽ không cần chạy lại bước này.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Bước 5: Sao chép toàn bộ code của dự án vào container
# Thao tác này sẽ sao chép các thư mục 'src', 'models', và các file khác.
COPY . .

# Bước 6: Thiết lập PYTHONPATH
# RẤT QUAN TRỌNG: Vì code của bạn nằm trong thư mục 'src',
# chúng ta cần báo cho Python biết để tìm các module trong thư mục gốc (/app).
ENV PYTHONPATH /app

# Bước 7: Lệnh để chạy ứng dụng của bạn
# Gunicorn sẽ tìm đối tượng 'app' trong file 'src/app.py'
# Render sẽ tự động sử dụng cổng được chỉ định bởi biến môi trường PORT,
# nhưng việc chỉ định rõ ràng với --bind cũng rất tốt.
CMD ["gunicorn", "--bind", "0.0.0.0:10000", "--workers", "2", "src.app:app"]
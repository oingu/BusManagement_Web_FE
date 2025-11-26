# 🎨 Theme màu vàng - School Bus Theme

## Tổng quan

Ứng dụng đã được thay đổi sang theme màu vàng, phù hợp với hình ảnh xe bus học đường!

## Màu sắc chính

### Primary (Vàng)
```
main: #fbc02d   (Yellow 700) - Màu vàng đậm
light: #fff59d  (Yellow 200) - Màu vàng sáng  
dark: #f57f17   (Yellow 900) - Màu vàng tối
```

### Secondary (Cam)
```
main: #ff6f00   (Orange 800) - Màu cam đậm
light: #ff9e40  - Màu cam sáng
dark: #c43e00   - Màu cam tối
```

### Success (Xanh lá)
```
main: #4caf50   (Green 500)
```

### Error (Đỏ)
```
main: #f44336   (Red 500)
```

### Background
```
default: #fffbf0 - Vàng nhạt (warm white)
paper: #ffffff   - Trắng
```

## Gradient sử dụng

### Login Page
```css
background: linear-gradient(135deg, #ffd54f 0%, #ff6f00 100%)
/* Gradient vàng sáng → cam đậm */
```

### Sidebar Header
```css
background: linear-gradient(135deg, #fbc02d 0%, #f57f17 100%)
/* Gradient vàng đậm → vàng tối */
```

## Component màu

### Buttons
- Primary button: Vàng #fbc02d
- Secondary button: Cam #ff6f00
- Text: Không viền hoa (textTransform: 'none')

### Cards
- Background: Trắng #ffffff
- Shadow: `0 2px 8px rgba(0,0,0,0.1)`
- Border radius: 8px

### Dashboard Stats Cards

**Card 1 - Nhân viên đi làm:**
- Color: `#2e7d32` (Xanh lá đậm)

**Card 2 - Học sinh đi học:**
- Color: `#1565c0` (Xanh dương đậm)

**Card 3 - Xe hoạt động:**
- Color: `#ed6c02` (Cam)

**Card 4 - Lộ trình:**
- Color: `#9c27b0` (Tím)

## Tại sao chọn màu vàng?

1. ✅ **Liên quan đến xe bus:** Xe bus học đường thường màu vàng
2. ✅ **Nổi bật:** Dễ nhận diện, thu hút
3. ✅ **Thân thiện:** Tạo cảm giác ấm áp, gần gũi
4. ✅ **An toàn:** Màu vàng mang ý nghĩa cảnh báo, an toàn giao thông

## So sánh trước/sau

### Trước (Xanh dương)
```
Primary: #1976d2 (Blue)
Cảm giác: Chuyên nghiệp, công sở
```

### Sau (Vàng)
```
Primary: #fbc02d (Yellow)
Cảm giác: Năng động, thân thiện, phù hợp với môi trường học đường
```

## Cách thay đổi theme

Tất cả màu được định nghĩa trong:
```
src/main.jsx
```

Để thay đổi lại màu khác:

```javascript
const theme = createTheme({
  palette: {
    primary: {
      main: '#your-color',
      light: '#your-light-color',
      dark: '#your-dark-color',
    },
  },
})
```

## Material Design Color Palette

Tham khảo: https://material.io/design/color/the-color-system.html

Các màu vàng Material Design:
- Yellow 50: #fffde7
- Yellow 100: #fff9c4
- Yellow 200: #fff59d
- Yellow 300: #fff176
- Yellow 400: #ffee58
- Yellow 500: #ffeb3b
- Yellow 600: #fdd835
- **Yellow 700: #fbc02d** ← Đang dùng
- Yellow 800: #f9a825
- **Yellow 900: #f57f17** ← Đang dùng

## Accessibility

Màu vàng #fbc02d đảm bảo:
- ✅ Contrast ratio đủ cho text màu đen
- ✅ Dễ đọc cho người khiếm thị màu
- ✅ Tuân thủ WCAG 2.1 Level AA

## Branding

Nếu muốn match với brand của trường:
1. Lấy màu chính của logo trường
2. Cập nhật trong `src/main.jsx`
3. Cập nhật gradient trong Login/Sidebar


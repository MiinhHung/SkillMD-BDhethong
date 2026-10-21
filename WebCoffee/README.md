# SID CORP Coffee

Website giới thiệu và bán sỉ cà phê của SID CORP (HTML/CSS/JS thuần, tiếng Việt).
Giao diện, bố cục và hiệu ứng mô phỏng theo https://roavero.webflow.io/ theo yêu cầu trong
`.claude/skills/design-system/SKILL.md`. Chỉ đổi tên thương hiệu và Việt hóa nội dung.

## Trang
| File | Nội dung | Mẫu tham chiếu |
|---|---|---|
| index.html | Trang chủ | / |
| xuong-rang.html | Xưởng rang | /our-roastery |
| ban-si.html | Bán sỉ | /wholesale |
| chuong-trinh-ban-si.html | Chương trình sỉ | /wholesale-program |
| quy-trinh.html | Quy trình | /how-it-works |
| lien-he.html | Liên hệ + form | /contact |

## Build
```
node tools/build.js   # src/pages + src/partials -> *.html ở thư mục gốc, sitemap.xml
node tools/check.js   # token sót, file/anchor thiếu, img alt/size, id trùng, số h1, tên "Roavero"
```
- Chỉ sửa trong `src/`. File `.html` ở thư mục gốc là file sinh ra.
- Dòng đầu mỗi `src/pages/*.html` là `<!--meta {JSON}-->`: title, description, nav, css, ctaLabel, schema.
- Build báo lỗi khi gặp dấu – hoặc —, hãy dùng `-`.
- Domain trong canonical/sitemap: hằng `SITE_URL` trong `tools/build.js` (đang là `https://coffee.sidcorp.vn`, cần đổi theo domain thật).

## Cấu trúc
- `assets/css/style.css`: token (theo skill), base, nút, header, footer, CTA, trang chủ.
- `assets/css/<trang>.css`: style riêng từng trang con.
- `assets/js/main.js`: hiệu ứng khai báo bằng thuộc tính `data-*` (xem chú thích đầu file),
  bám sát thông số của mẫu: hero hiện dần khi tải, 3 ly xòe khi cuộn 0-560px, thẻ xếp chồng thu nhỏ,
  ảnh lớn co 1.1 về 1, slider có phím mũi tên và vuốt. Tắt hết khi `prefers-reduced-motion`.

## Quyết định thiết kế
- **Font chữ thân: Hanken Grotesk thay cho DM Sans.** Skill ghi DM Sans có subset tiếng Việt, nhưng
  Google Fonts không có subset `vietnamese` cho DM Sans (đã kiểm tra), nên chữ có dấu sẽ bị lẫn font.
  Hanken Grotesk có dáng gần nhất và hỗ trợ tiếng Việt.
- **Font tiêu đề: Fraunces** (giống mẫu, có subset tiếng Việt). Khác với quy chuẩn chung của
  `frontend-themes/CLAUDE.md` (không khuyến khích Fraunces), vì khách yêu cầu giống mẫu nhất có thể.
- Tiêu đề không dùng `letter-spacing` âm và có line-height từ 1.2 trở lên (mẫu dùng -0.5px và 1.1),
  theo quy tắc tiếng Việt của skill.
- Ly cà phê ở hero là ảnh thật trong khung vòm, vì không dùng lại ảnh cắt nền của template.

## Cần bổ sung trước khi chạy thật
- Form liên hệ chưa nối máy chủ: `main.js` đang giả lập gửi. Thay bằng `fetch()` tới endpoint thật
  (Formspree, Google Apps Script, API riêng...).
- Link mạng xã hội trong footer đang trỏ về trang chủ Facebook/Instagram/TikTok.
- Nội dung là bản Việt hóa từ mẫu. SID CORP cần duyệt lại thông tin sản phẩm, vùng giao hàng, điều khoản.
- Ảnh OG mặc định: `assets/img/cafe-interior.jpg`.

## Ảnh
Toàn bộ ảnh trong `assets/img/` lấy từ Unsplash (Unsplash License, dùng thương mại miễn phí,
không bắt buộc ghi nguồn). Danh sách ID gốc: `assets/img/SOURCES.txt` (tên file, ID ảnh, kích thước).
Ảnh có thể thay bằng ảnh thật của SID CORP, giữ nguyên tên file và cập nhật `width`/`height`.

---
name: tao-website
description: Build a complete Vietnamese static website from a site folder's design-system SKILL.md (làm/tạo website từ skill.md). Use when the user adds a new site folder containing `.claude/skills/design-system/SKILL.md`, asks to "làm web", "tạo trang", "chạy skill.md", or names a site folder to build or rebuild.
---

# Tạo website từ design-system SKILL.md

Mỗi site là một thư mục ở gốc repo (vd. `WebCoffee/`, `BĐS/BĐS1/`) có file
`.claude/skills/design-system/SKILL.md` do người dùng thêm vào. File đó là đề bài.
Argument (nếu có) là đường dẫn thư mục site; nếu không có, chạy
`node .claude/hooks/pending-sites.js` để tìm thư mục có SKILL.md mà chưa có `index.html`.
Nếu có nhiều thư mục đang chờ, hỏi người dùng làm thư mục nào.

## 1. Đọc hết trước khi làm
1. Đọc toàn bộ `<site>/.claude/skills/design-system/SKILL.md`: thương hiệu, ngành, URL mẫu, token
   (màu, font, spacing, radius, motion), câu kiểu "giống mẫu nhất", ghi chú trong ngoặc.
2. Đọc `CLAUDE.md` gốc và `frontend-themes/CLAUDE.md` (quy chuẩn chung).
3. Xem mọi ảnh người dùng gửi kèm (logo, ảnh chụp chỗ cần đổi) và các file khác trong thư mục site.
4. Xem 2 site đã làm để tái sử dụng công cụ: `BĐS/BĐS1/` (sao chép mẫu Webflow) và `WebCoffee/`
   (dựng tay bằng `src/pages` + `src/partials`, có `tools/build.js` + `tools/check.js`).

## 2. Thứ tự ưu tiên khi mâu thuẫn
Lời người dùng trong chat > SKILL.md của site > `frontend-themes/CLAUDE.md` > các skill trong `.agents/skills/`.
Không bao giờ bỏ qua dù mẫu yêu cầu gì:
- Font phải có subset `vietnamese` (font gốc của mẫu thường không có dấu: thay bằng font cùng dáng có tiếng Việt).
- `<html lang="vi">`, toàn bộ chữ hiển thị, alt, title, meta, placeholder, thông báo form bằng tiếng Việt.
- Không giữ tên/logo thương hiệu của mẫu; dùng logo người dùng cung cấp (lưu vào `<site>/assets/img/`).
- Không commit `.mcp.json` hay token.
Mọi ngoại lệ so với `frontend-themes/CLAUDE.md` (vd. font Fraunces, logo lớn cuối footer theo yêu cầu) phải ghi vào README của site.

## 3. Chọn cách làm
**A. Có URL mẫu + yêu cầu giống mẫu** (thường gặp): sao chép trung thành.
- Mẫu Webflow/HTML tĩnh: dùng lại `BĐS/BĐS1/tools/` (`mirror.js` tải trang + asset về `assets/wf/` và viết lại link;
  `extract.js` liệt kê chuỗi cần dịch; `vi.json` bản dịch; `build.js` áp bản dịch, đổi logo, font, menu;
  `serve.js` xem thử). Sửa `PAGES`/`LINKS` trong mirror.js theo trang của mẫu, đặt tên file tiếng Việt không dấu.
- Mẫu không tải được nguyên khối: dựng lại theo cấu trúc WebCoffee, đo thông số (khoảng cách, cỡ chữ, hiệu ứng) từ mẫu
  bằng Playwright rồi bám sát.
- Câu chữ: dịch sát nghĩa, tự nhiên, đúng ngành; số liệu/ngày/đơn vị theo kiểu Việt Nam (dd/mm/yyyy, m², triệu USD).
- Link tới trang chỉ có trong template (Style Guide, Licenses, Changelog, Home V2...) đổi thành trang thật của site.

**B. Không có mẫu**: thiết kế mới theo `frontend-themes/CLAUDE.md` mục 1 (Design Read, 3 dial, hero/header/footer,
palette + font không trùng site khác), dùng skill `design-taste-frontend` / `high-end-visual-design` cho thẩm mỹ,
cấu trúc kỹ thuật như WebCoffee.

## 4. Kiểm tra (bắt buộc trước khi báo xong)
1. Chạy build + check của site (nếu có), sửa đến khi sạch.
2. Chạy server tĩnh, mở bằng Playwright: chụp desktop 1440px và mobile 390px cho trang chủ và ít nhất 2 trang con,
   cuộn hết trang để kích hoạt hiệu ứng. Soi: chữ có dấu bị lẫn font, chữ tràn/xuống dòng xấu ở menu và tiêu đề lớn,
   ảnh thiếu, logo sai, còn sót tiếng Anh hoặc tên thương hiệu mẫu (quét text node bằng `browser_evaluate`).
3. Xem console: lỗi do thiếu file phải sửa; lỗi của dịch vụ ngoài (Turnstile form Webflow...) chỉ cần báo lại.
4. Xoá thư mục ảnh chụp `.playwright-mcp/` sinh ra trong repo.

## 5. Bàn giao
- Viết `<site>/README.md`: danh sách trang, lệnh build/xem thử, quyết định thiết kế và ngoại lệ, việc còn thiếu
  (form chưa có backend, domain thật...).
- Báo người dùng bằng tiếng Việt: đã đổi gì theo yêu cầu, tự quyết thêm gì, cách xem thử.
- Không commit/push nếu chưa được yêu cầu. Khi được yêu cầu: commit trên `main`, đẩy lên remote `hethong`
  (github.com/MiinhHung/SkillMD-BDhethong), chỉ add thư mục site và file liên quan.

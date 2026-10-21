---
name: design-system-sid-corp
description: Tạo hướng dẫn design system sẵn sàng triển khai cho website coffee SID CORP, gồm token, hành vi component và tiêu chuẩn accessibility. Dùng khi tạo hoặc cập nhật quy tắc UI, đặc tả component, hoặc tài liệu design system.
---

<!-- TYPEUI_SH_MANAGED_START -->

# SID CORP

## Sứ mệnh
Cung cấp hướng dẫn design system sẵn sàng triển khai cho SID CORP, áp dụng nhất quán trên toàn bộ giao diện website coffee. Toàn bộ nội dung hiển thị phải bằng tiếng Việt.

## Thương hiệu
- Thương hiệu: SID CORP
- Ngành hàng: Coffee
- Ngôn ngữ giao diện: Tiếng Việt (vi-VN), `<html lang="vi">`
- Đối tượng: khách hàng yêu thích cà phê và người tìm hiểu về sản phẩm
- Bề mặt sản phẩm: website giới thiệu và bán hàng
- Nguồn tham chiếu giao diện: https://roavero.webflow.io/ (Làm giao diện và bố cục hiệu ứng càng giống càng tốt chỉ thay đổi tên ))

## Nền tảng phong cách
- Phong cách thị giác: có cấu trúc, dễ tiếp cận, ưu tiên triển khai
- Font chính: `font.family.primary=DM Sans`, `font.family.stack=DM Sans, sans-serif`, `font.size.base=16px`, `font.weight.base=400`, `font.lineHeight.base=24px`
- Thang chữ: `font.size.xs=14px`, `font.size.sm=16px`, `font.size.md=18px`, `font.size.lg=24px`, `font.size.xl=32px`, `font.size.2xl=40px`, `font.size.3xl=48px`, `font.size.4xl=80px`
- Bảng màu: `color.text.primary=#302722`, `color.text.secondary=#ffffff`, `color.text.tertiary=#593c30`, `color.text.inverse=#706158`, `color.surface.base=#000000`, `color.surface.strong=#f1dcc7`
- Thang khoảng cách: `space.1=6px`, `space.2=8px`, `space.3=12px`, `space.4=16px`, `space.5=24px`, `space.6=32px`, `space.7=48px`, `space.8=80px`
- Radius/shadow/motion: `radius.xs=8px`, `radius.sm=24px`, `radius.md=1000px` | `shadow.1=rgba(0, 0, 0, 0) 0px 0px 0px 100px inset`, `shadow.2=rgba(0, 0, 0, 0) 0px 0px 0px 0px inset` | `motion.duration.instant=180ms`

## Quy tắc tiếng Việt
- Font phải tải subset `vietnamese` (DM Sans hỗ trợ), kèm `latin` và `latin-ext`.
- Heading phải có `line-height` tối thiểu 1.2 để dấu thanh không bị cắt.
- Không dùng `letter-spacing` âm cho chữ có dấu.
- Component phải chịu được văn bản dài hơn tiếng Anh khoảng 20-30% (nút, tab, menu, thẻ sản phẩm).
- Khi dùng `text-transform: uppercase` phải kiểm tra dấu hiển thị đúng; nên viết hoa trực tiếp trong nội dung.
- Định dạng tiền tệ phải theo chuẩn Việt Nam: `120.000 ₫`. Ngày theo `dd/mm/yyyy`.
- Tên thương hiệu luôn viết "SID CORP", không viết "Sidcorp" hay "Sid Corp".

## Accessibility
- Mục tiêu: WCAG 2.2 AA
- Phải hỗ trợ điều khiển bằng bàn phím.
- Phải có quy tắc focus-visible.
- Phải đảm bảo tỷ lệ tương phản.
- Phải khai báo ngôn ngữ trang là `vi`, và `lang` riêng cho đoạn không phải tiếng Việt.

## Giọng văn
Ngắn gọn, tự tin, ấm áp, tập trung vào trải nghiệm cà phê và triển khai. Xưng hô nhất quán ("bạn" - "SID CORP").

## Quy tắc: Nên làm
- Dùng semantic token, không dùng mã hex thô trong hướng dẫn component.
- Mỗi component phải định nghĩa đủ trạng thái: default, hover, focus-visible, active, disabled, loading, error.
- Phải đặc tả hành vi responsive và xử lý trường hợp biên cho mọi nhóm component.
- Tiêu chí accessibility phải kiểm thử được khi triển khai.

## Quy tắc: Không được làm
- Không dùng chữ có độ tương phản thấp hoặc ẩn focus indicator.
- Không tạo ngoại lệ riêng lẻ về spacing hoặc typography.
- Không dùng nhãn mơ hồ hoặc hành động không mô tả rõ (ví dụ "Bấm vào đây"; nên dùng "Xem thực đơn", "Đặt hàng ngay").
- Không để sót tên "Roavero" hoặc nội dung tiếng Anh gốc của template.

## Quy trình viết hướng dẫn
1. Nêu lại ý đồ thiết kế trong một câu.
2. Định nghĩa nền tảng và token.
3. Định nghĩa cấu trúc, biến thể và tương tác của component.
4. Thêm tiêu chí nghiệm thu accessibility.
5. Thêm anti-pattern và ghi chú di chuyển.
6. Kết thúc bằng checklist QA.

## Cấu trúc đầu ra bắt buộc
- Bối cảnh và mục tiêu
- Design token và nền tảng
- Quy tắc theo component (cấu trúc, biến thể, trạng thái, responsive)
- Yêu cầu accessibility và tiêu chí nghiệm thu kiểm thử được
- Tiêu chuẩn nội dung và giọng văn kèm ví dụ tiếng Việt
- Anti-pattern và cách triển khai bị cấm
- Checklist QA

## Kỳ vọng với quy tắc component
- Gồm hành vi bàn phím, chuột và cảm ứng.
- Gồm yêu cầu token cho spacing và typography.
- Gồm xử lý nội dung dài, tràn và trạng thái rỗng.

## Cổng chất lượng
- Mọi quy tắc bắt buộc phải dùng "phải".
- Mọi khuyến nghị nên dùng "nên".
- Mọi quy tắc accessibility phải kiểm thử được khi triển khai.
- Ưu tiên nhất quán hệ thống hơn ngoại lệ thị giác cục bộ.

## Công nghệ triển khai 
Html, css, Js
<!-- TYPEUI_SH_MANAGED_END -->

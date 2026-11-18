# Topick 香氣訂製示範

一個可以玩完的前端示範：揀 Topick 香氣、調濃度、改 100mm × 45mm 瓶身標籤，再改禮盒上允許更換的位置。畫面即時更新。不會落單，也不會接付款。

香氣、價錢與香調整理自 [topickperfume.mo](https://topickperfume.mo/)。中文名稱跟官網（例如茶多酚、棬木一族）。官網產品頁若未列香調，介面會標明「示意香調」，不會當成官方配方。

## 本地運行

需要 Node.js 20.9 或以上。

```bash
npm install
npm run dev
```

打開 [http://localhost:3000](http://localhost:3000)。

```bash
npm run lint
npm run build
npm start
```

## 部署到 Vercel

1. 把這個 repo 匯入 Vercel，Framework Preset 選 **Next.js**。
2. 不需要環境變數。Build Command 用 `npm run build`，Output 用預設。
3. 部署完成後即可打開預覽網址。

根目錄就是 Next.js App Router 專案，`next.config.ts` 已可直接給 Vercel 使用。

## 顧客流程

1. **揀香** — 一列香名。點選之後才顯示前調、中調、後調，並可調濃度。這一步沒有即時預覽。
2. **標籤** — 只改產品名稱。刀模預覽在控制項下面。
3. **禮盒** — 只改盒面主圖、盒上名稱，以及右側面板頂部那一行短句。預覽同樣在控制項下面。
4. **結果** — 可旋轉的立體瓶子與禮盒。標籤、盒面圖、盒上名稱和側板短句會貼上剛剛訂的內容。

店方圖庫的圖已按盒面相框比例做好，選了就貼上。自行上傳若比例不同，只能在相框內拖移和縮放，圖片會被裁切，不會拉滿成個禮盒。立體模型是 `public/models/topick-pack.glb`，在瀏覽器裡顯示，不會在請求時跑 Blender。

在最後結果可以儲存這份訂製。圖片與資料寫入私人的 Vercel Blob，顧客會看到訂單編號。同一瀏覽階段再儲存會更新同一張訂單。

工坊檢視在 `/studio`，不會從顧客頁面連過去。登入用已設定的 `STUDIO_PASSWORD`，密碼只留在伺服器。

## 刀模

- `public/dieline/topick-dieline.jpg` — 附上的原圖（橙色筆圈只是標示可改位置）。
- `public/dieline/base.jpg` — 畫布用的底圖。橙色筆圈已去掉，可改的名稱與主圖位置留白，由介面疊上去。

## 日後接上官網

產品資料在 `lib/catalog.ts` 的 `getCatalog()`。之後只要改這個函式去讀官網或商店 API，並維持同一個資料形狀，訂製畫面不用重寫。每件產品都有 `sourceUrl` 指向對應的產品頁。

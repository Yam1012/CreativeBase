/**
 * アフィリエイトASP設定（レントラックス + もしもアフィリエイト）
 * 本番タグに差し替える際はここの値を更新してください
 */

// ========== レントラックス ==========
export const RENTRACKS = {
  sid: 10872,
  pid: 15534,
  /** LP計測タグ（全ページ共通） */
  lpTag: `
<script type="text/javascript">
(function(callback){
var script = document.createElement("script");
script.type = "text/javascript";
script.src = "https://www.rentracks.jp/js/itp/rt.track.js?t=" + (new Date()).getTime();
if ( script.readyState ) {
script.onreadystatechange = function() {
if ( script.readyState === "loaded" || script.readyState === "complete" ) {
script.onreadystatechange = null;
callback();
}
};
} else {
script.onload = function() {
callback();
};
}
document.getElementsByTagName("head")[0].appendChild(script);
}(function(){}));
</script>`,
};

/**
 * レントラックスCV（成果）タグを生成
 * @param price 売上金額（税別）
 * @param cinfo 成果識別情報（ユーザーID等）
 */
export function buildRentracksCvTag(price: number, cinfo: string): string {
  return `
<script type="text/javascript">
(function(){
function loadScriptRTCV(callback){
var script = document.createElement('script');
script.type = 'text/javascript';
script.src = 'https://www.rentracks.jp/js/itp/rt.track.js?t=' + (new Date()).getTime();
if ( script.readyState ) {
script.onreadystatechange = function() {
if ( script.readyState === 'loaded' || script.readyState === 'complete' ) {
script.onreadystatechange = null;
callback();
};
};
} else {
script.onload = function() {
callback();
};
};
document.getElementsByTagName('head')[0].appendChild(script);
}
loadScriptRTCV(function(){
_rt.sid = ${RENTRACKS.sid};
_rt.pid = ${RENTRACKS.pid};
_rt.price = ${price};
_rt.reward = -1;
_rt.cname = '';
_rt.ctel = '';
_rt.cemail = '';
_rt.cinfo = '${encodeURIComponent(cinfo)}';
rt_tracktag();
});
}(function(){}));
</script>`;
}

// ========== もしもアフィリエイト ==========
// ※ 管理画面から成果タグコードを取得後に差し替えてください
export const MOSHIMO = {
  /** もしもアフィリエイト プロモーションID（ダミー） */
  promotionId: "DUMMY_MOSHIMO_ID",
  /** LP計測タグ（ダミー） */
  lpTag: `
<script type="text/javascript">
/* もしもアフィリエイト LP計測タグ（ダミー） */
/* 本番用タグに差し替えてください */
console.log("[Moshimo] LP tracking tag loaded (dummy)");
</script>`,
};

/**
 * もしもアフィリエイトCV（成果）タグを生成（ダミー）
 * 管理画面から取得した本番タグに差し替えてください
 */
export function buildMoshimoCvTag(price: number, orderId: string): string {
  return `
<script type="text/javascript">
/* もしもアフィリエイト CV（成果）タグ（ダミー） */
/* 本番用タグに差し替えてください */
console.log("[Moshimo] CV tag fired - price: ${price}, orderId: ${orderId}");
</script>`;
}

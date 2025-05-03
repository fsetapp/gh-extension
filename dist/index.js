let o = [];
const l = () => {
  var c;
  const n = JSON.parse(window["memex-data"].textContent), a = JSON.parse(
    window["memex-paginated-items-data"].textContent
  ), r = a.groups.nodes.find(
    (e) => e.groupValue === "Done"
  ), i = [];
  for (const e of a.groupedItems) {
    if (e.groupId !== (r == null ? void 0 : r.groupId)) continue;
    const s = e.nodes.toSorted(
      (t, m) => new Date(m.issueClosedAt).getTime() - new Date(t.issueClosedAt).getTime()
    );
    for (let t = 0; t < s.length; t++)
      i.push({
        memexProjectItemId: s[t].id,
        previousMemexProjectItemId: ((c = s[t - 1]) == null ? void 0 : c.id) ?? ""
      });
  }
  for (const e of i)
    o.push(
      fetch(`https://github.com/memexes/${n.id}/items`, {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "github-verified-fetch": "true"
        },
        body: JSON.stringify(e),
        method: "PUT",
        mode: "cors",
        credentials: "include"
      })
    );
  setTimeout(() => {
    Promise.all(o).then((e) => {
      o = [];
    }).catch((e) => {
      o = [];
    });
  }, 1e3);
};
let d, u = !1;
new MutationObserver(() => {
  const n = document.querySelector(
    "[data-board-column='Done'] [data-dnd-drop-type='card']"
  );
  n && !d && !u && (d || (d = new MutationObserver(() => {
    o.length === 0 && l();
  })), d.observe(n, { childList: !0 }), u = !0, console.log("gh-board extension activated"));
}).observe(document.documentElement, { childList: !0, subtree: !0 });

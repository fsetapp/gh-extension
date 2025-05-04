let a, u = !1;
new MutationObserver(() => {
  const t = document.querySelector(
    "[data-board-column='Done'] [data-dnd-drop-type='card']"
  );
  t && !a && !u && (a || (a = new MutationObserver(() => {
    if (d.length === 0) {
      const { dataId: o, doneReorderPayload: e } = m();
      p(o, e);
    }
  })), a.observe(t, { childList: !0 }), u = !0, console.log("gh-board extension activated"));
}).observe(document.documentElement, { childList: !0, subtree: !0 });
let d = [];
const m = () => {
  var c;
  const t = JSON.parse(window["memex-data"].textContent), o = JSON.parse(
    window["memex-paginated-items-data"].textContent
  ), e = o.groups.nodes.find(
    (n) => n.groupValue === "Done"
  ), i = [];
  for (const n of o.groupedItems) {
    if (n.groupId !== (e == null ? void 0 : e.groupId)) continue;
    const s = n.nodes.toSorted(
      (r, l) => new Date(l.issueClosedAt).getTime() - new Date(r.issueClosedAt).getTime()
    );
    for (let r = 0; r < s.length; r++)
      i.unshift({
        memexProjectItemId: s[r].id,
        previousMemexProjectItemId: ((c = s[r - 1]) == null ? void 0 : c.id) ?? ""
      });
  }
  return { dataId: t.id, doneReorderPayload: i };
}, p = (t, o) => {
  for (const e of o)
    d.push(
      fetch(`https://github.com/memexes/${t}/items`, {
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
    Promise.all(d).then((e) => {
      d = [];
    }).catch((e) => {
      d = [];
    });
  }, 1e3);
};

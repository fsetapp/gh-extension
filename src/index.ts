// import board from "./board.json";

let doneColumnBoxObserver: MutationObserver;
let isObserving: boolean = false;

new MutationObserver(() => {
  const doneColumnBox = document.querySelector(
    `[data-board-column='Done'] [data-dnd-drop-type='card']`
  );

  if (doneColumnBox) {
    if (!doneColumnBoxObserver && !isObserving) {
      doneColumnBoxObserver ||= new MutationObserver(() => {
        if (isReorderLoading.length === 0) {
          const { dataId, doneReorderPayload } = getDoneReorderPayload();
          reqPutReorderCards(dataId, doneReorderPayload);
        }
      });
      doneColumnBoxObserver.observe(doneColumnBox, { childList: true });
      isObserving = true;
      console.log("gh-board extension activated");
    }
  }
}).observe(document.documentElement, { childList: true, subtree: true });

type BoardGroup = {
  groupValue: string;
};
let isReorderLoading: Promise<Response>[] = [];
const getDoneReorderPayload = () => {
  const data = JSON.parse((window as any)["memex-data"].textContent);
  const board = JSON.parse(
    (window as any)["memex-paginated-items-data"].textContent
  );
  const done = board.groups.nodes.find(
    (a: BoardGroup) => a.groupValue === "Done"
  );
  const doneReorderPayload = [];
  for (const groupItem of board.groupedItems) {
    if (groupItem.groupId !== done?.groupId) continue;

    type Card = (typeof groupItem.nodes)[0] & { issueClosedAt: string };
    const cards = groupItem.nodes as Array<Card>;
    const sortedCards = cards.toSorted(
      (a, b) =>
        new Date(b.issueClosedAt).getTime() -
        new Date(a.issueClosedAt).getTime()
    );
    for (let i = 0; i < sortedCards.length; i++) {
      doneReorderPayload.unshift({
        memexProjectItemId: sortedCards[i].id,
        previousMemexProjectItemId: sortedCards[i - 1]?.id ?? "",
      });
    }
  }
  return { dataId: data.id, doneReorderPayload };
};

type ReqReorderPayload = {
  memexProjectItemId: number;
  previousMemexProjectItemId: number | "";
};
const reqPutReorderCards = (dataId: number, payload: ReqReorderPayload[]) => {
  for (const reorderPayload of payload) {
    isReorderLoading.push(
      fetch(`https://github.com/memexes/${dataId}/items`, {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "github-verified-fetch": "true",
        },
        body: JSON.stringify(reorderPayload),
        method: "PUT",
        mode: "cors",
        credentials: "include",
      })
    );
  }
  setTimeout(() => {
    Promise.all(isReorderLoading)
      .then((res) => {
        isReorderLoading = [];
      })
      .catch((reason) => {
        isReorderLoading = [];
      });
  }, 1000);
};

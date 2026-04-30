export function AppPreview() {
  return (
    <div className="flex gap-4 px-4">
      {/* Playbook preview */}
      <div className="w-44 shrink-0 rounded-xl border border-white/20 bg-white/95 p-3 shadow-lg backdrop-blur-sm dark:bg-gray-900/90">
        <p className="mb-2 text-[10px] font-bold text-gray-800 dark:text-gray-100">
          플레이북
        </p>
        <div className="rounded-lg border border-gray-200 p-2 dark:border-gray-700">
          <p className="mb-1 text-[8px] font-semibold text-gray-700 dark:text-gray-200">
            경기 전 체크리스트
          </p>
          <p className="mb-2 text-[6px] text-gray-400">
            최근 느낀점에서 자동 선별
          </p>
          <ul className="space-y-1">
            {[
              "포핸드 팔로스루를 끝까지 올린다",
              "서브 토스는 항상 같은 높이로",
              "백핸드 준비를 빨리 한다",
              "발리 시 스플릿 스텝을 잊지 않는다",
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-1 text-[6.5px] text-gray-600 dark:text-gray-300"
              >
                <span className="mt-px text-[6px] text-gray-400">
                  {i + 1}.
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-2 text-[5.5px] text-emerald-600">
          마지막 갱신: 오늘 14:25
        </p>
      </div>

      {/* History preview */}
      <div className="w-44 shrink-0 rounded-xl border border-white/20 bg-white/95 p-3 shadow-lg backdrop-blur-sm dark:bg-gray-900/90">
        <p className="mb-2 text-[10px] font-bold text-gray-800 dark:text-gray-100">
          히스토리
        </p>
        {/* Time summary */}
        <div className="mb-2 rounded-lg border border-gray-200 p-2 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-[6.5px] text-gray-500">총 소요 시간</p>
            <div className="flex gap-0.5">
              {["주", "월", "년"].map((t) => (
                <span
                  key={t}
                  className="rounded border border-gray-200 px-1 py-px text-[5px] text-gray-500 dark:border-gray-600"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <p className="mt-1 text-[11px] font-bold text-gray-800 dark:text-gray-100">
            3시간 20분
          </p>
        </div>
        {/* Record cards */}
        {[
          { type: "레슨", date: "04.28", dur: "55분", text: "포핸드 팔로스루를 끝까지..." },
          { type: "경기", date: "04.25", dur: "2시간", text: "서브 토스 높이를 일정하게..." },
        ].map((r, i) => (
          <div
            key={i}
            className="mb-1.5 rounded-lg border border-gray-200 p-1.5 dark:border-gray-700"
          >
            <div className="flex items-center gap-1">
              <span className="rounded-full bg-gray-100 px-1 py-px text-[5.5px] text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                {r.type}
              </span>
              <span className="text-[6px] font-medium text-gray-700 dark:text-gray-200">
                {r.date}
              </span>
              <span className="text-[5.5px] text-gray-400">· {r.dur}</span>
            </div>
            <p className="mt-0.5 truncate text-[6px] text-gray-500 dark:text-gray-400">
              {r.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

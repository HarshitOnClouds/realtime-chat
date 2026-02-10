export function ChatSkeleton() {
    return (
        <div className="flex flex-col gap-4 w-52">
            <div className="flex gap-4 items-center">
                <div className="skeleton w-10 h-10 rounded-full shrink-0"></div>
                <div className="flex flex-col gap-2">
                    <div className="skeleton h-4 w-28"></div>
                    <div className="skeleton h-4 w-20"></div>
                </div>
            </div>
        </div>
    );
}

export function SidebarSkeleton() {
    return (
        <div className="flex flex-col gap-4 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4 items-center">
                    <div className="skeleton w-10 h-10 rounded-full shrink-0"></div>
                    <div className="flex flex-col gap-2">
                        <div className="skeleton h-4 w-32"></div>
                        <div className="skeleton h-3 w-20"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function MessageSkeleton() {
    return (
        <div className="flex flex-col gap-4 p-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                    <div className="skeleton w-10 h-10 rounded-full shrink-0"></div>
                    <div className="flex flex-col gap-2">
                        <div className="skeleton h-12 w-48 rounded-lg"></div>
                        <div className={`skeleton h-3 w-16 ${i % 2 === 0 ? 'self-end' : ''}`}></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

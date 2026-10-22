// Firebase RTDB는 경로에 . # $ [ ] 를 허용하지 않으므로 _ 로 치환
export const sanitizeRtdbKey = (key: string) => key.replace(/[.#$[\]]/g, '_');

/**
 * 会话回调
 */
export default interface IChatCallBack {
  resStream: (str: string) => void
  resFailed: (err: string) => void
  resComplate: () => void
}

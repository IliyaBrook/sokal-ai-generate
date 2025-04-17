import Shared from "./Shared";

export default async function SharedPage({
  params,
}: {
  params: Promise<{ linkId: string }>
}) {
  const { linkId } = await params
  return <Shared linkId={linkId} />;
}

import Shared from "./Shared";

export default function SharedPage({
  params,
}: {
  params: { linkId: string };
}) {
  return <Shared linkId={params.linkId} />;
}
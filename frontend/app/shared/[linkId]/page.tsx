export default function Shared({
  params,
}: {
  params: { linkId: string };
}) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Shared Post</h1>
      <p>Post ID: {params.linkId}</p>
    </div>
  );
}
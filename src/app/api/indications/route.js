import dbConnect from "../../../lib/mongodb";
import Indication from "../../../models/indication";

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const searchQuery = searchParams.get("name") || ""; 
  const leaderId = searchParams.get("leaderId"); // Certifique-se de que o parâmetro está correto

  const indications = await Indication.find({ 
    leaderId,
    name: { $regex: searchQuery, $options: "i" }
  });
  return new Response(JSON.stringify(indications), { status: 200 });
}

export async function POST(req) {
  await dbConnect();
  const data = await req.json();
  const newIndication = new Indication(data);
  await newIndication.save();
  return new Response(JSON.stringify(newIndication), { status: 201 });
}

export async function DELETE(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const indicationId = searchParams.get("id");

  if (!indicationId) {
    return new Response(JSON.stringify({ error: "ID is required" }), { status: 400 });
  }

  const result = await Indication.deleteOne({ _id: indicationId });

  if (result.deletedCount === 0) {
    return new Response(JSON.stringify({ error: "Indication not found" }), { status: 404 });
  }

  return new Response(JSON.stringify({ message: "Indication deleted successfully" }), { status: 200 });
}
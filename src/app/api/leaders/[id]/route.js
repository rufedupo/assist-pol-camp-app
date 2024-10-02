import dbConnect from "../../../../lib/mongodb";
import Indication from "../../../../models/indication";
import Leader from "../../../../models/leader";

export async function GET(req, { params }) {
  await dbConnect();
  const { id } = params;
  
  if (!id) {
    return new Response(JSON.stringify({ error: "ID is required" }), { status: 400 });
  }
  try {
    const leader = await Leader.findById(id)

    if (!leader) {
      return new Response(JSON.stringify({ error: "Leader not found" }), { status: 404 });
    }

    const indications = await Indication.find({ 
      leaderId: id
    });

    const totalVotes = indications ? indications.length : 0

    return new Response(JSON.stringify({...leader.toObject(), totalVotes }), { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar líder:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

export async function PUT(req, { params }) {
  await dbConnect();
  const { id } = params;
  
  if (!id) {
    return new Response(JSON.stringify({ error: "ID is required" }), { status: 400 });
  }

  try {
    const { name } = await req.json();

    if (!name) {
      return new Response(JSON.stringify({ error: "Name is required" }), { status: 400 });
    }

    const leader = await Leader.findById(id)

    if (!leader) {
      return new Response(JSON.stringify({ error: "Leader not found" }), { status: 404 });
    }

    leader.name = name;

    await leader.save();
    
    return new Response(JSON.stringify({...leader.toObject()}), { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar líder:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  await dbConnect();
  const { id } = params;

  if (!id) {
    return new Response(JSON.stringify({ error: "ID is required" }), { status: 400 });
  }

  await Indication.deleteOne({ leaderId: id });

  const result = await Leader.deleteOne({ _id: id });

  if (result.deletedCount === 0) {
    return new Response(JSON.stringify({ error: "Leader not found" }), { status: 404 });
  }

  return new Response(JSON.stringify({ message: "Leader deleted successfully" }), { status: 200 });
}
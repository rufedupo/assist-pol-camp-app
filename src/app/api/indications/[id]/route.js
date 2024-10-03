import dbConnect from "../../../../lib/mongodb";
import Indication from "../../../../models/indication";


export async function PUT(req, { params }) {
  await dbConnect();
  const { id } = params;
  
  if (!id) {
    return new Response(JSON.stringify({ error: "ID is required" }), { status: 400 });
  }

  try {
    const { 
      name,
      contact,
      electoralCard,
      electoralZone,
      electoralSection,
      electoralLocation,
      ownerLeader
    } = await req.json();

    if (!name) {
      return new Response(JSON.stringify({ error: "Name is required" }), { status: 400 });
    }

    if (!contact) {
      return new Response(JSON.stringify({ error: "Contact is required" }), { status: 400 });
    }

    if (!electoralCard) {
      return new Response(JSON.stringify({ error: "ElectoralCard is required" }), { status: 400 });
    }

    if (!electoralZone) {
      return new Response(JSON.stringify({ error: "ElectoralZone is required" }), { status: 400 });
    }

    if (!electoralSection) {
      return new Response(JSON.stringify({ error: "ElectoralSection is required" }), { status: 400 });
    }

    if (!electoralLocation) {
      return new Response(JSON.stringify({ error: "ElectoralLocation is required" }), { status: 400 });
    }

    const indication = await Indication.findById(id)

    if (!indication) {
      return new Response(JSON.stringify({ error: "Indication not found" }), { status: 404 });
    }

    indication.name = name;
    indication.contact = contact;
    indication.electoralCard = electoralCard;
    indication.electoralZone = electoralZone;
    indication.electoralSection = electoralSection;
    indication.electoralLocation = electoralLocation;
    indication.ownerLeader = ownerLeader ? true : false;

    await indication.save();
    
    return new Response(JSON.stringify({...indication.toObject()}), { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar indicação:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  await dbConnect();
  const { id } = params;

  if (!id) {
    return new Response(JSON.stringify({ error: "ID is required" }), { status: 400 });
  }

  const result = await Indication.deleteOne({ _id: id });

  if (result.deletedCount === 0) {
    return new Response(JSON.stringify({ error: "Indication not found" }), { status: 404 });
  }

  return new Response(JSON.stringify({ message: "Indication deleted successfully" }), { status: 200 });
}
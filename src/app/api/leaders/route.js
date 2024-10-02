import dbConnect from "../../../lib/mongodb";
import Leader from "../../../models/leader";

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const searchQuery = searchParams.get("name") || "";
  try { 
    const leaderList = await Leader.aggregate([
      {
        $match: {
          name: { $regex: searchQuery, $options: "i" }, // Filtra líderes com base na pesquisa
        },
      },
      {
        $lookup: {
          from: "indications", // Nome da coleção de indicações
          localField: "_id", // Campo do líder
          foreignField: "leaderId", // Campo que referencia o líder nas indicações
          as: "indications", // Nome do novo campo que conterá as indicações
        },
      },
      {
        $addFields: {
          totalVotes: { $size: "$indications" }, // Calcula o total de votos
        },
      },
      {
        $project: {
          name: 1, // Inclui o nome do líder
          totalVotes: 1, // Inclui o total de votos
        },
      },
      {
        $sort: { name: 1 } 
      }
    ]);
    return new Response(JSON.stringify(leaderList), { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar lideranças:", error);
    return new Response(JSON.stringify({ error: "Erro ao buscar lideranças" }), { status: 500 });
  }
}

export async function POST(req) {
  await dbConnect();
  const data = await req.json();
  const newLeader = new Leader(data);
  await newLeader.save();
  return new Response(JSON.stringify(newLeader), { status: 201 });
}
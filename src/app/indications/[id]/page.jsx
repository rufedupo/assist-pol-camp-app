"use client"; 

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styles from "./page.module.css";
import PhoneInput from "../../components/PhoneInput";
import ElectoralCardInput from "../../components/ElectoralCardInput";

const IndicationPage = () => {
  const { id } = useParams();
  const [leader, setLeader] = useState(null);
  const [indications, setIndications] = useState([]);
  const [loading, setLoading] = useState(true); // Para exibir um carregando
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalVotes, setTotalVotes] = useState(0);

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [electoralCard, setElectoralCard] = useState("");
  const [electoralZone, setElectoralZone] = useState("");
  const [electoralSection, setElectoralSection] = useState("");
  const [electoralLocation, setElectoralLocation] = useState("");

  const [selectedIndication, setSelectedIndication] = useState(null);

  const isFormValid = 
    name && 
    contact && 
    electoralCard && 
    electoralZone && 
    electoralSection && 
    electoralLocation;

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    fetchIndications(e.target.value);
  };

  const fetchIndications = async (query = "") => {
    if (id) {
      const res = await fetch(`/api/indications?leaderId=${id}&name=${query}`);
      if (res.ok) {
        const data = await res.json();
        setIndications(data);
      } else {
        console.error("Erro ao buscar indicações:", res.statusText);
      }
      setLoading(false);
    }
  };

  const fetchLeader = async () => {
    if (id) {
      const res = await fetch(`/api/leaders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setLeader(data);
        setTotalVotes(data.totalVotes)
      } else {
        console.error("Erro ao buscar liderança:", res.statusText);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeader();
    fetchIndications();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>; // Exibe uma mensagem de carregamento
  }

  const openModal = (indication = null) => {
    setSelectedIndication(indication);
    if (indication !== null) {
      setName(indication.name);
      setContact(indication.contact);
      setElectoralCard(indication.electoralCard);
      setElectoralZone(indication.electoralZone);
      setElectoralSection(indication.electoralSection);
      setElectoralLocation(indication.electoralLocation);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    inputClear()
    setSelectedIndication(undefined); // Limpa o líder selecionado
    setIsModalOpen(false);
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    const newIndication = event.target.elements;
    const indicationData = {
      name: newIndication.name.value,
      contact: newIndication.contact.value,
      electoralCard: newIndication.electoralCard.value,
      electoralZone: newIndication.electoralZone.value,
      electoralSection: newIndication.electoralSection.value,
      electoralLocation: newIndication.electoralLocation.value,
      leaderId: id
    }

    if (selectedIndication.name) {
      const res = await fetch(`/api/indications/${selectedIndication._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(indicationData),
      });

      if (res.ok) {
        setIndications((prev) =>
          prev.map((indication) =>
            indication._id === selectedIndication._id
              ? { 
                ...indication, 
                name: indicationData.name,
                contact: indicationData.contact,
                electoralCard: indicationData.electoralCard,
                electoralZone: indicationData.electoralZone,
                electoralSection: indicationData.electoralSection,
                electoralLocation: indicationData.electoralLocation
              }
              : indication
          )
        );
      } else {
        console.error("Erro ao editar a liderança");
      }
    } else {
      const res = await fetch("/api/indications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(indicationData),
      });
      if (res.ok) {
        const data = await res.json();
        setIndications((prev) => [...prev, {
          name: data.name,
          contact: data.contact,
          electoralCard: data.electoralCard,
          electoralZone: data.electoralZone,
          electoralSection: data.electoralSection,
          electoralLocation: data.electoralLocation
        }]);
        setTotalVotes(totalVotes + 1)
        inputClear()
      } else {
        console.error("Erro ao adicionar nova indicação");
      }
    }
    closeModal();
  };

  const handleBack = () => {
    window.location.href = "/";
  };

  const handleDelete = async (indicationId) => {
    setLoading(true)
    const res = await fetch(`/api/indications/${indicationId}`, {
      method: "DELETE",
    });
  
    if (res.ok) {
      setIndications((prev) => prev.filter((indication) => indication._id !== indicationId));
      setTotalVotes(totalVotes - 1)
    } else {
      console.error("Erro ao excluir a indicação:", res.statusText);
    }
    setLoading(false)
  };

  const inputClear = () => {
    setName('');
    setContact('');
    setElectoralCard('');
    setElectoralZone('');
    setElectoralSection('');
    setElectoralLocation('');
  }

  const formatElectoralCard = (card) => {
    return card?.replace(/\D/g, '').replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
  };

  const formatPhone = (phone) => {
    return phone?.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "($1) $2 ").replace(/(\d{4})(\d)/, "$1-$2");
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
      <div>
        <button onClick={handleBack} className={styles.button}> {/* Botão de voltar */}
          Voltar
        </button>
        <br/>
        <br/>
        <h2>Lista de Indicações (Liderança: {leader?.name})</h2>  

        <input
          type="text"
          placeholder="Pesquisar por nome"
          value={searchQuery}
          onChange={handleSearch}
          className={styles.searchInput}
        />
          <br/>
          <button onClick={openModal} className={styles.button}>
            Adicionar Indicação
          </button >
          <br/>
          <br/>
          {indications.length > 0 && 
            <> 
              <h4>Total de Votos Geral: {totalVotes}</h4>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Indicação</th>
                    <th style={{textAlign: 'center'}}>Contato</th>
                    <th style={{textAlign: 'center'}}>Número do Título</th>
                    <th style={{textAlign: 'right'}}>Zona</th>
                    <th style={{textAlign: 'right'}}>Seção</th>
                    <th>Local de Votação</th>
                    <th style={{textAlign: 'center'}}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {indications.map((indication) => (
                    <tr key={indication._id}>
                      <td>{indication.name}</td>
                      <td style={{textAlign: 'center'}}>{formatPhone(indication.contact)}</td>
                      <td style={{textAlign: 'center'}}>{formatElectoralCard(indication.electoralCard)}</td>
                      <td style={{textAlign: 'right'}}>{indication.electoralZone}</td>
                      <td style={{textAlign: 'right'}}>{indication.electoralSection}</td>
                      <td>{indication.electoralLocation}</td>
                      <td style={{textAlign: 'center'}}>
                        <button
                          onClick={() => openModal(indication)} // Abre modal com o líder a ser editado
                          className={styles.buttonEdit}
                          style={{marginRight: '5px'}}
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDelete(indication._id)} 
                          className={styles.buttonDelete}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))} 
                </tbody>
              </table>
            </>
          }
          {indications.length === 0 && 
            <>
            <strong><u>Nenhuma indicação cadastrada</u></strong>
            </>
          }
          <br/>
        </div>
        {isModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2>{selectedIndication.name ? "Editar Liderança" : "Adicionar Liderança"}</h2>
              <form onSubmit={handleSubmit}>
                <label htmlFor="name">Nome:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <PhoneInput id="contact" name="contact" contact={formatPhone(contact)} setContact={setContact} required />
                <ElectoralCardInput id="electoralCard" name="electoralCard" electoralCard={formatElectoralCard(electoralCard)} setElectoralCard={setElectoralCard} required />
                <label htmlFor="electoralZone">Zona:</label>
                <input
                  type="number"
                  id="electoralZone"
                  name="electoralZone"
                  value={electoralZone}
                  onChange={(e) => setElectoralZone(e.target.value)}
                  required
                />
                <label htmlFor="electoralSection">Seção:</label>
                <input
                  type="number"
                  id="electoralSection"
                  name="electoralSection"
                  value={electoralSection}
                  onChange={(e) => setElectoralSection(e.target.value)}
                  required
                />
                <label htmlFor="electoralLocation">Local de Votação:</label>
                <input
                  type="text"
                  id="electoralLocation"
                  name="electoralLocation"
                  value={electoralLocation}
                  onChange={(e) => setElectoralLocation(e.target.value)}
                  required
                />
                <div className={styles.modalActions}>
                  <button
                    type="submit"
                    className={styles.button}
                    disabled={!isFormValid} // Desabilita o botão se o formulário não for válido
                  >
                    {selectedIndication.name ? "Atualizar" : "Enviar"}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className={styles.buttonClose}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default IndicationPage;

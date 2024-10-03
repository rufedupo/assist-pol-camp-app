"use client"; 

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styles from "./page.module.css";
import PhoneInput from "../../components/PhoneInput";
import ElectoralCardInput from "../../components/ElectoralCardInput";
import Swal from 'sweetalert2';

const IndicationPage = () => {
  const { id } = useParams();
  const [leader, setLeader] = useState(null);
  const [indications, setIndications] = useState([]);
  const [loading, setLoading] = useState(true); // Para exibir um carregando
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalVotes, setTotalVotes] = useState(0);
  const [totalLeader, setTotalLeader] = useState(0);
  const [total, setTotal] = useState(0);

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [electoralCard, setElectoralCard] = useState("");
  const [electoralZone, setElectoralZone] = useState("");
  const [electoralSection, setElectoralSection] = useState("");
  const [electoralLocation, setElectoralLocation] = useState("");
  const [ownerLeader, setOwnerLeader] = useState(false);

  const [selectedIndication, setSelectedIndication] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

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
    }
  };

  useEffect(() => {
    Swal.fire({
      title: 'Carregando informações...',
      text: 'Por favor, aguarde.',
      allowOutsideClick: loading,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    Promise.all([fetchLeader(), fetchIndications()])
    .then(() => {
      Swal.close();
      setLoading(false);
    })
    .catch((error) => {
      console.error('Erro ao carregar informações:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Falha ao carregar as informações.'
      });
    });
  }, [id]);

  useEffect(() => {
    const ownerCount = indications.some(i => i.ownerLeader === true) === true ? 1 : 0;
    var totalLeader = totalVotes > 0 ? ((50*ownerCount)+(totalVotes-ownerCount)*10) : 0;
    var total = totalLeader > 0 ? (totalLeader + (totalVotes-ownerCount)*50) : 0;
    setTotalLeader(totalLeader)
    setTotal(total)
  }, [totalVotes]);

  const openModal = (indication = null) => {
    setSelectedIndication(indication);
    if (indication !== null) {
      setName(indication.name);
      setContact(indication.contact);
      setElectoralCard(indication.electoralCard);
      setElectoralZone(indication.electoralZone);
      setElectoralSection(indication.electoralSection);
      setElectoralLocation(indication.electoralLocation);
      setOwnerLeader(indication.ownerLeader);
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
    if (!isSubmitting) {
      setIsSubmitting(true);
      const newIndication = event.target.elements;
      const indicationData = {
        name: newIndication.name.value,
        contact: newIndication.contact.value,
        electoralCard: newIndication.electoralCard.value,
        electoralZone: newIndication.electoralZone.value,
        electoralSection: newIndication.electoralSection.value,
        electoralLocation: newIndication.electoralLocation.value,
        ownerLeader: ownerLeader,
        leaderId: id
      }
  
      if (selectedIndication.name) {
        Swal.fire({
          title: 'Editando...',
          text: 'Por favor, aguarde.',
          allowOutsideClick: loading,
          didOpen: () => {
            Swal.showLoading();
          }
        });
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
                  electoralLocation: indicationData.electoralLocation,
                  ownerLeader: indicationData.ownerLeader
                }
                : indication
            )
            .sort((a, b) => a.name.localeCompare(b.name))
          );
          Swal.close();
          Swal.fire('Editado!', 'A indicação foi editada com sucesso.', 'success');
        } else {
          Swal.close();
          Swal.fire('Erro!', 'Ocorreu um erro ao editar a indicação.', 'error');
          console.error("Erro ao editar a indicação");
        }
      } else {
        Swal.fire({
          title: 'Adicionando...',
          text: 'Por favor, aguarde.',
          allowOutsideClick: loading,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const res = await fetch("/api/indications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(indicationData),
        });
        if (res.ok) {
          const data = await res.json();
          setIndications((prev) => 
            [...prev, {
              _id: data._id,
              name: data.name,
              contact: data.contact,
              electoralCard: data.electoralCard,
              electoralZone: data.electoralZone,
              electoralSection: data.electoralSection,
              electoralLocation: data.electoralLocation,
              ownerLeader: data.ownerLeader
            }]
            .sort((a, b) => a.name.localeCompare(b.name))
          );
          setTotalVotes(totalVotes + 1)
          inputClear()
          Swal.close();
          Swal.fire('Adicionado!', 'A indicação foi adicionada com sucesso.', 'success');
        } else {
          Swal.close();
          Swal.fire('Erro!', 'Ocorreu um erro ao adicionar a indicação.', 'error');
          console.error("Erro ao adicionar a indicação");
        }
      }
      closeModal();
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    window.location.href = "/";
  };

  const handleDelete = async (indicationId) => {
    const confirmation = await Swal.fire({
      title: 'Tem certeza?',
      text: "Essa ação não pode ser desfeita!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    });
  
    if (confirmation.isConfirmed) {
      setLoading(true);
      
      const res = await fetch(`/api/indications/${indicationId}`, {
        method: 'DELETE',
      });
  
      if (res.ok) {
        setIndications((prev) => 
          prev
            ?.filter((indication) => indication._id !== indicationId)
            .sort((a, b) => a.name.localeCompare(b.name))
        );
        setTotalVotes(totalVotes - 1);
        Swal.fire('Excluído!', 'A indicação foi excluída com sucesso.', 'success');
      } else {
        Swal.fire('Erro!', 'Ocorreu um erro ao excluir a indicação.', 'error');
        console.error('Erro ao excluir a indicação:', res.statusText);
      }
  
      setLoading(false);
    }
  };

  const inputClear = () => {
    setName('');
    setContact('');
    setElectoralCard('');
    setElectoralZone('');
    setElectoralSection('');
    setElectoralLocation('');
    setOwnerLeader(false);
  }

  const formatElectoralCard = (card) => {
    return card?.replace(/\D/g, '').replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
  };

  const formatPhone = (phone) => {
    const cleaned = phone?.replace(/\D/g, "");
  
    if (cleaned?.length === 11) {
      return cleaned.replace(/^(\d{2})(\d{1})(\d{4})(\d{4})/, "($1) $2 $3-$4");
    } else if (cleaned?.length === 10) {
      return cleaned.replace(/^(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    
    return phone;
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
      {!loading && <div>
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
          {indications?.length > 0 && 
            <> 
              <div style={{display: 'flex', gap: '10px'}}>
                <h4>Total de Votos Geral: {totalVotes}</h4>
                <h4>Total para Liderança: {totalLeader}</h4>
                <h4>Total para Geral: {total}</h4>
              </div>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Indicação</th>
                    <th style={{textAlign: 'left'}}>Contato</th>
                    <th style={{textAlign: 'center'}}>Número do Título</th>
                    <th style={{textAlign: 'right'}}>Zona</th>
                    <th style={{textAlign: 'right'}}>Seção</th>
                    <th>Local de Votação</th>
                    <th style={{textAlign: 'center'}}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {indications.map((indication) => (
                    <tr key={indication._id} style={{backgroundColor: indication.ownerLeader ? 'darkblue': ''}}>
                      <td>{indication.name}</td>
                      <td style={{textAlign: 'left'}}>{formatPhone(indication.contact)}</td>
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
          {indications?.length === 0 && 
            <>
            <strong><u>Nenhuma indicação cadastrada</u></strong>
            </>
          }
          <br/>
        </div>}
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
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'row-reverse',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexWrap: 'nowrap'
                }}>
                  <div>
                    <span>Liderança</span>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      id="ownerLeader"
                      name="ownerLeader"
                      checked={ownerLeader}
                      onChange={(e) => setOwnerLeader(e.target.checked)}
                      style={{ marginRight: '8px' }}
                      disabled={!ownerLeader && indications.some((i) => i.ownerLeader)}
                    />
                  </div>
                </div>
                <div className={styles.modalActions}>
                  <button
                    type="submit"
                    className={styles.button}
                    disabled={!isFormValid && isSubmitting} // Desabilita o botão se o formulário não for válido
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

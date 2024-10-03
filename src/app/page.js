"use client"; 

import Link from "next/link";
import styles from "./page.module.css";
import { useEffect, useMemo, useState } from "react";
import Swal from 'sweetalert2';

export default function Home() {
  const [loading, setLoading] = useState(true); 
  const [leaders, setLeaders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortConfig, setSortConfig] = useState({ 
    key: 'name', 
    direction: 'ascending'
  });

  const fetchLeaders = async (query = "") => {
    const res = await fetch(`/api/leaders?name=${query}`);
    const data = await res.json();
    const leaders = data.map((l) => {
      var ownerCount = l.hasOwnerLeader ? 1 : 0;
      var totalLeader = l.totalVotes > 0 ? ((50*ownerCount)+((l.totalVotes-ownerCount)*10)) : 0;
      var total = totalLeader > 0 ? (totalLeader + (l.totalVotes-ownerCount)*50) : 0;
      return {
        ...l,
        totalLeader,
        total
      }
    })
    setLeaders(leaders);
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
    Promise.all([fetchLeaders()])
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
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    fetchLeaders(e.target.value);
  };
  
  const openModal = (leader = null) => {
    setSelectedLeader(leader); // Define o líder selecionado (null para adicionar)
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedLeader(undefined); // Limpa o líder selecionado
    setIsModalOpen(false);
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isSubmitting){
      setIsSubmitting(true);
      const leaderName  = event.target.elements.leader.value;
    
      if (selectedLeader.name) {
        Swal.fire({
          title: 'Editando...',
          text: 'Por favor, aguarde.',
          allowOutsideClick: loading,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const res = await fetch(`/api/leaders/${selectedLeader._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: leaderName }),
        });
  
        if (res.ok) {
          setLeaders((prev) =>
            prev.map((leader) =>
              leader._id === selectedLeader._id
                ? { ...leader, name: leaderName }
                : leader
            )
            .sort((a, b) => a.name.localeCompare(b.name))
          );
          setSortConfig({ 
            direction: 'ascending', 
            key: 'name' 
          });
          Swal.close();
          Swal.fire('Editado!', 'A liderança foi editada com sucesso.', 'success');
        } else {
          Swal.close();
          Swal.fire('Erro!', 'Ocorreu um erro ao editar a liderança.', 'error');
          console.error("Erro ao editar a liderança");
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
        const res = await fetch("/api/leaders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: leaderName }),
        });
        if (res.ok) {
          const data = await res.json();
          setLeaders((prev) => 
            [...prev, {
              _id: data._id,
              name: data.name,
              totalVotes: 0,
              totalLeader: 0,
              total: 0
            }]
            .sort((a, b) => a.name.localeCompare(b.name))
          );
          setSortConfig({ 
            direction: 'ascending', 
            key: 'name'
          });
          Swal.close();
          Swal.fire('Adicionado!', 'A liderança foi adicionada com sucesso.', 'success');
        } else {
          Swal.close();
          Swal.fire('Erro!', 'Ocorreu um erro adicionar a liderança.', 'error');
          console.error("Erro ao adicionar a liderança");
        }
      }
      closeModal();
      setIsSubmitting(false);
    }
  };

  const totalVotosGeral = leaders.reduce((total, leader) => total + leader.totalVotes, 0);
  const totalGeral = leaders.reduce((total, leader) => total + leader.total, 0);

  const handleDelete = async (leaderId) => {
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
      Swal.fire({
        title: 'Excluindo...',
        text: 'Por favor, aguarde.',
        allowOutsideClick: loading,
        didOpen: () => {
          Swal.showLoading();
        }
      });
  
      const res = await fetch(`/api/leaders/${leaderId}`, {
        method: 'DELETE',
      });
  
      if (res.ok) {
        Swal.close();
        setLeaders((prev) => 
          prev
            .filter((leader) => leader._id !== leaderId) 
            .sort((a, b) => a.name.localeCompare(b.name))
        );
        setSortConfig({ 
          direction: 'ascending', 
          key: 'name'
        });
        Swal.fire('Excluído!', 'A liderança foi excluída com sucesso.', 'success');
      } else {
        Swal.close();
        Swal.fire('Erro!', 'Ocorreu um erro ao excluir a liderança.', 'error');
        console.error('Erro ao excluir a liderança:', res.statusText);
      }
    }
  };

  const requestSort = (key) => {
    setSortConfig({
      direction: sortConfig.direction  === 'ascending' ? 'descending' : 'ascending',
      key
    })
  };

  const sortedData = useMemo(() => {
    let sortableItems = leaders;
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [leaders, sortConfig]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {!loading && <div>
          <h2>Lista de Liderança</h2>  

          <input
            type="text"
            placeholder="Pesquisar por nome"
            value={searchQuery}
            onChange={handleSearch}
            className={styles.searchInput}
          />
          <br/>
          <button onClick={openModal} className={styles.button}>
            Adicionar Liderança
          </button >
          <br/>
          <br/>
          {leaders.length > 0 && 
            <> 
              <h4>Total de Votos Geral: {totalVotosGeral}</h4>
              <h5>Total: {totalGeral}</h5>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>
                      Liderança <span onClick={() => requestSort('name')} style={{cursor: 'pointer'}}>{sortConfig.key === 'name' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '-'}</span>
                    </th>
                    <th style={{textAlign: 'center'}}>
                      Total de Votos <span onClick={() => requestSort('totalVotes')} style={{cursor: 'pointer'}}>{sortConfig.key === 'totalVotes' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '-'}</span>
                    </th>
                    <th style={{textAlign: 'center'}}>
                      Total <span onClick={() => requestSort('total')} style={{cursor: 'pointer'}}>{sortConfig.key === 'total' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '-'}</span>
                    </th>
                    <th style={{textAlign: 'center'}}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((leader) => (
                    <tr key={leader._id}>
                      <td> 
                        <Link href={`/indications/${leader._id}`} className={styles.link}>
                          <u>{leader.name}</u>
                        </Link>
                      </td>
                      <td style={{textAlign: 'center'}}>{leader.totalVotes}</td>
                      <td style={{textAlign: 'center'}}>{leader.totalLeader}</td>
                      <td style={{textAlign: 'center'}}>{leader.total}</td>
                      <td style={{textAlign: 'center'}}>
                        <button
                          onClick={() => openModal(leader)} // Abre modal com o líder a ser editado
                          className={styles.buttonEdit}
                          style={{marginRight: '5px'}}
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDelete(leader._id)} 
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
          {leaders.length === 0 && 
            <>
            <strong><u>Nenhuma liderança cadastrada</u></strong>
            </>
          }
          <br/>
        </div>}
        {isModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2>{selectedLeader.name ? "Editar Liderança" : "Adicionar Liderança"}</h2>
              <form onSubmit={handleSubmit}>
                <label htmlFor="indication">Nome da Liderança:</label>
                <input
                  type="text"
                  id="leader"
                  name="leader"
                  defaultValue={selectedLeader.name ? selectedLeader.name : ""}
                  required
                />
                <div className={styles.modalActions}>
                  <button type="submit" className={styles.button} disabled={isSubmitting}>
                    {selectedLeader.name ? "Atualizar" : "Enviar"}
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
}

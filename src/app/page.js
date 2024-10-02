"use client"; 

import Link from "next/link";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import Swal from 'sweetalert2';

export default function Home() {
  const [loading, setLoading] = useState(true); 
  const [leaders, setLeaders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLeaders = async (query = "") => {
    const res = await fetch(`/api/leaders?name=${query}`);
    const data = await res.json();
    setLeaders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaders();
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
          );
          Swal.fire('Editado!', 'A liderança foi editada com sucesso.', 'success');
        } else {
          Swal.fire('Erro!', 'Ocorreu um erro ao editar a liderança.', 'error');
          console.error("Erro ao editar a liderança");
        }
      } else {
        const res = await fetch("/api/leaders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: leaderName }),
        });
        if (res.ok) {
          const data = await res.json();
          setLeaders((prev) => [...prev, {
            name: data.name,
            totalVotes: 0
          }]);
          Swal.fire('Adicionado!', 'A liderança foi adicionada com sucesso.', 'success');
        } else {
          Swal.fire('Erro!', 'Ocorreu um erro adicionar a liderança.', 'error');
          console.error("Erro ao adicionar a liderança");
        }
      }
      closeModal();
      setIsSubmitting(false);
    }
  };

  const totalVotosGeral = leaders.reduce((total, leader) => total + leader.totalVotes, 0);

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
      setLoading(true);
  
      const res = await fetch(`/api/leaders/${leaderId}`, {
        method: 'DELETE',
      });
  
      if (res.ok) {
        setLeaders((prev) => prev.filter((leader) => leader._id !== leaderId));
        Swal.fire('Excluído!', 'A liderança foi excluída com sucesso.', 'success');
      } else {
        Swal.fire('Erro!', 'Ocorreu um erro ao excluir a liderança.', 'error');
        console.error('Erro ao excluir a liderança:', res.statusText);
      }
  
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
      <div>
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
              <h5>Total: {((totalVotosGeral*50)+((totalVotosGeral-leaders.filter((leader) => leader.totalVotes > 0).length)*10))}</h5>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Liderança</th>
                    <th style={{textAlign: 'center'}}>Total de Votos</th>
                    <th style={{textAlign: 'center'}}>Total Liderança</th>
                    <th style={{textAlign: 'center'}}>Total</th>
                    <th style={{textAlign: 'center'}}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {leaders.map((leader) => (
                    <tr key={leader._id}>
                      <td> 
                        <Link href={`/indications/${leader._id}`} className={styles.link}>
                          <u>{leader.name}</u>
                        </Link>
                      </td>
                      <td style={{textAlign: 'center'}}>{leader.totalVotes}</td>
                      <td style={{textAlign: 'center'}}>{leader.totalVotes > 0 ? (50+((leader.totalVotes-1)*10)) : 0}</td>
                      <td style={{textAlign: 'center'}}>{leader.totalVotes > 0 ? ((leader.totalVotes*50)+((leader.totalVotes-1)*10)) : 0}</td>
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
        </div>
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

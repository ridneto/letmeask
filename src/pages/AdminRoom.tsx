import { useParams } from 'react-router';

import logoImg from '../assets/images/logo.svg';
import deleteImg from '../assets/images/delete.svg';

import { Button } from '../components/Button';
import { Question } from '../components/Question';
import { RoomCode } from '../components/RoomCode';
import { useRoom } from '../hooks/useRoom';
import { database } from '../services/firebase';

import '../styles/room.scss';
import { useHistory } from 'react-router-dom';

type RoomParams = {
  id: string;
};

export function AdminRoom(){
  const history = useHistory()
  const { id } = useParams<RoomParams>()
  const { title, questions } = useRoom(id)

  async function handleDeleteQuestion(questionId: string){
    if(window.confirm("Tem certeza que você deseja excluir esta pergunta?")){
      await database.ref(`rooms/${id}/questions/${questionId}`).remove();
    }
  }

  async function handleEndRoom(){
    database.ref(`rooms/${id}`).update({
      endDate: new Date()
    });

    history.push('/');
  }

  return (
    <div id="page-room"> 
      <header>
        <div className="content">
          <img src={logoImg} alt="Letmeask" />
          <div>
            <RoomCode roomCode={id}/>
            <Button type="submit" isOutlined onClick={handleEndRoom}> Encerrar sala </Button>
          </div>
        </div>
      </header>

      <main>
        <div className="room-title">
          <h1>Sala {title}</h1>
          { questions.length > 0 && 
            <span>{questions.length} Pergunta(s)</span>
          }
        </div>

        <div className="question-list">
          {questions.map(question => { 
            return (
              <Question 
                key={question.id}
                content={question.content}
                author={question.author}
              >
                <button
                  type="button"
                  onClick={() => handleDeleteQuestion(question.id)}
                >
                  <img src={deleteImg} alt="Remover pergunta" />
                </button>
              </Question>
            )
          })}
        </div>
      </main>
    </div>
  )
}
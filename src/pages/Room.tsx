import { useEffect } from 'react';
import { FormEvent, useState } from 'react';
import { useParams } from 'react-router';

import logoImg from '../assets/images/logo.svg';
import { Button } from '../components/Button';
import { RoomCode } from '../components/RoomCode';
import { useAuth } from '../hooks/useAuth';
import { database } from '../services/firebase';

import '../styles/room.scss';

type firebaseQuestions = Record<string, {
  author: {
    name: string;
    avatar: string;
  },
  content: string;
  isAnswered: boolean;
  isHighlighted: boolean
}>

type RoomParams = {
  id: string;
};

type Questions = {
  id: string;
  author: {
    name: string;
    avatar: string;
  },
  content: string;
  isAnswered: boolean;
  isHighlighted: boolean
}

export function Room(){
  const { user } = useAuth()
  const { id } = useParams<RoomParams>()
  const [ newQuestion, setNewQuestion ] = useState('');
  const [ questions, setQuestions ] = useState<Questions[]>([])
  const [ title, setTitle ] = useState('')

  useEffect(() => {
    database.ref(`rooms/${id}`).on('value', room => {
      const databaseRoom = room.val();
      const firebaseQuestions: firebaseQuestions = databaseRoom.questions ?? {};
      const parsedQuestions = Object.entries(firebaseQuestions).map(([key, value]) => {
        return {
          id: key, 
          content: value.content,
          author: value.author,
          isHighlighted: value.isHighlighted,
          isAnswered: value.isAnswered
        };
      });
      
      setQuestions(parsedQuestions);
      setTitle(databaseRoom.title);
    });
  }, [ id ]);

  async function handleSendQuestion (event: FormEvent) {
    event.preventDefault();

    if(!user){
      throw new Error('You most be logged in')
    }

    if(newQuestion.trim() === "") return;

    const question = {
      concent: newQuestion,
      author: {
        name: user.name,
        avatar: user.avatar,
      },
      isHighlighted: false,
      isAnswered: false
    };

    await database.ref(`rooms/${id}/questions`).push(question);
    setNewQuestion('');
  } 

  return (
    <div id="page-room"> 
      <header>
        <div className="content">
          <img src={logoImg} alt="Letmeask" />
          <RoomCode roomCode={id}/>
        </div>
      </header>

      <main>
        <div className="room-title">
          <h1>Sala {title}</h1>
          { questions.length && 
            <span>{questions.length} Pergunta(s)</span>
          }
        </div>

        <form onSubmit={handleSendQuestion}>
          <textarea 
            placeholder="O que você quer perguntar?"
            onChange={event => setNewQuestion(event.target.value)}
            value={newQuestion}
          />

          <div className="form-footer">
            { user ? (
              <div className="user-info"> 
                <img src={user.avatar} alt={user.name} />
                <span>{user.name}</span>
              </div>
            ) : (
              <span>Para enviar sua pergunta, <button>faça seu login</button>.</span>
            ) }
            <Button type="submit" disabled={!user}>Enviar pergunta</Button>
          </div>
        </form>

        ${JSON.stringify(questions)}
      </main>
    </div>
  )
}
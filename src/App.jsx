import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import AnecdoteForm from './components/AnecdoteForm'
import Notification from './components/Notification'
import { getAnecdotes, voting } from './requests'
import NotificationContext from '../NotificationContext'
import { useReducer } from 'react'

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_NOTIFICATION':
      return action.payload
    
    case 'CLEAR':
      return ''
  
    default:
      return state
  }
}

const App = () => {
  const [notification, notificationDispatch] = useReducer(notificationReducer, '')

  const queryClient = useQueryClient()
  const votingMutation = useMutation({
    mutationFn: voting,
    onSuccess: (voted) => {
      const anecdotes = queryClient.getQueryData(['anecdotes'])
      queryClient.setQueryData(['anecdotes'], anecdotes.map(x => x.id === voted.id ? voted : x))
      notificationDispatch({ type: 'SET_NOTIFICATION', payload: `anecdote '${voted.content}' voted` })
    }
  })

  const handleVote = (anecdote) => {
    console.log('vote')
    anecdote.votes += 1
    votingMutation.mutate(anecdote)
  }

  const result = useQuery({
    queryKey: ['anecdotes'],
    queryFn: getAnecdotes,
    retry: 1
  })

  if (result.isLoading) {
    return null
  }

  if (result.isError) {
    return (
      <div>anecdote service not avaliable due to problems in server</div>
    )
  }

  const anecdotes = result.data

  return (
    <div>
      <h3>Anecdote app</h3>

      <NotificationContext.Provider value={[notification, notificationDispatch]}>
        <Notification />
        <AnecdoteForm />

        {anecdotes.map(anecdote =>
          <div key={anecdote.id}>
            <div>
              {anecdote.content}
            </div>
            <div>
              has {anecdote.votes}
              <button onClick={() => handleVote(anecdote)}>vote</button>
            </div>
          </div>
        )}
      </NotificationContext.Provider>
    </div>
  )
}

export default App

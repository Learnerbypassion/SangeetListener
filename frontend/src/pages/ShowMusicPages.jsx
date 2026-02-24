import React, {useEffect, useState} from 'react'
import MusicCards from '../components/MusicCards.jsx'
import axios from 'axios';
import { data } from 'react-router-dom';

const ShowMusicPages = () => {
	const [urlOfTheMusic, setUrlOfTheMusic] = useState([]);
	const [title, setTitle] = useState([]);
	const [data, setData] = useState([])
	useEffect(() => {
	  axios.get("http://localhost:3000/api/music/list-musics")
	.then((res)=>{
		setData(res.data.musics)
		setTitle(data.map(e => e.title));
		setUrlOfTheMusic(data.map(e => e.uri));
	})
	}, []);
  return (
    <div className='w-full h-screen flex flex-wrap justify-center bg-linear-to-br from-gray-900 to-black p-6 gap-3'>
		{
			data.map((elem , idx)=>{
				return <MusicCards key={idx} title={elem.title} uri={elem.uri} />
			})
		}
    </div>
  )
}

export default ShowMusicPages
import express from "express";
import { PrismaClient } from "@prisma/client";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/movies", async (_, res) => {

    try {
    
        const [movies, totalMovies, averageDurationCall] = await Promise.all([
            prisma.movie.findMany({
                orderBy: {
                    title: "asc",
                },
                include: {
                    genres: true,
                    languages: true,
                },            
            }),
    
            prisma.movie.count(),
    
            prisma.movie.aggregate({
                _avg: {
                    duration: true
                }
            })
        ]);
    
        const averageDuration = averageDurationCall._avg.duration;
    
    
        const moviesResponse = {            
            totalMovies,
            averageDuration,
            movies
        };
    
        res.json(moviesResponse);
        

        
    } catch(error) {
        return res.status(500).send({message: "Ocorreu um erro ao buscar os dados dos filmes"});
    }
});

app.get("/movies/filter", async (req,res) => {
    const { language, sort } = req.query;


    const languageName = language as string;
    const sortMovie = sort as string;

    let orderBy = {};
    if (sortMovie === "duration") {
        orderBy = {
            duration: "asc",
        };
    } else if (sortMovie === "release_date") {
        orderBy = {
            release_date: "asc",
        };
    } else if (sortMovie === "oscar_count") {
        orderBy = {
            oscar_count: "asc",
        };
    } else if (sortMovie === "title") {
        orderBy = {
            title: "asc",
        };
    }

    let where = {};
    if (languageName) {
        where = {
            languages: {
                name: {
                    equals: languageName,
                    mode: "insensitive",
                },
            },
        };
    }
    

    try {
        const movies = await prisma.movie.findMany({
            orderBy,
            where: where,
            include: {
                genres: true,
                languages: true,
            },
        });

        if (movies.length ===  0) {
            return res.status(404).send({ message: "Nenhum filme encontrado com esse critério de busca" });
        }

        res.json(movies);
    } catch (error) {
        return res.status(500).send({message: "Ocorreu um erro ao tentar acessar essa listagem de filmes"});
    }
});


app.post("/movies", async (req, res) => {

    const { title, genre_id, language_id, oscar_count, release_date } = req.body;

    try {

        const movieWithSameTitle = await prisma.movie.findFirst({
            where: {
                title: {equals: title, mode: "insensitive"}
            }
        });

        if (movieWithSameTitle) {
            return res.status(409).send({message: "Já existe um filme cadastrado com esse título"});
        }

        await prisma.movie.create({
            data: {
                title,
                genre_id,
                language_id,
                oscar_count,
                release_date: new Date(release_date)
            },
        });
    }  catch(error) {
        return res.status(500).send({message: "Falha ao cadastrar um filme"});
    }

    res.status(201).send({message: "Filme cadastrado com sucesso"});
});

app.put("/movies/:id", async (req,res) => {

    const id = Number(req.params.id);

    try {
        const movie = await prisma.movie.findUnique({
            where: {
                id
            }
        });
    
    
        if (!movie) {
            return res.status(404).send({message: "Filme não encontrado"});
        }

        const data = {...req.body};
        data.release_date = data.release_date ? new Date(data.release_date) : undefined;
    
        await prisma.movie.update({

            where: {
                id
            },
            data: data
        });
    } catch(error) {
        return res.status(500).send({message: "Falha ao atualizar o registro do filme"});
    }

    res.status(200).send("Filme atualizado com sucesso");

});

app.delete("/movies/:id", async (req,res) => {
    const id = Number(req.params.id);

    try {
        const movie = await prisma.movie.findUnique({
            where: {
                id
            }
        });

        if(!movie) {
            return res.status(404).send({message: "Filme não encontrado"});
        }

        await prisma.movie.delete({
            where: {
                id: id
            }
        });
    } catch (error) {
        return res.status(500).send("Falha ao remover o registro");
    }

    res.status(200).send({message: "Filme removido com sucesso"});
});

app.get("/movies/:genreName", async (req, res) => {
   
    const genreName = req.params.genreName;    

    try{
        const genreExists = await prisma.genre.findFirst({
            where: {
                name: {
                    equals: genreName,
                    mode: "insensitive"
                }
            }
        });

        if (!genreExists) {
            return res.status(404).send({message: "Este gênero não existe"});
        }
        
        const moviesFilteredByGenreName = await prisma.movie.findMany( {
            include: {
                genres: true,
                languages: true
            },
            where: {
                genres: {
                    name: {
                        equals: genreName,
                        mode: "insensitive"
                    }
                }
            }
        });
        
        res.status(200).send(moviesFilteredByGenreName);
        
    } catch(error) {

        return res.status(500).send( {message: "Falha ao filtrar filmes por gênero"});
    }
  
});

app.put("/genres/:id", async (req,res) =>{
    const genreId = Number(req.params.id);

    try {
        const genres = await prisma.genre.findUnique({
            where: {
                id: genreId
            }
        });

        if (!genres) {
            return res.status(404).send({message: "Gênero não encontrado"});
        }

        const data = req.body;

        await prisma.genre.update({
            where:{
                id: genreId
            },
            data
        });
        
    } catch (error) {
        return res.status(500).send({message: "Falha ao tentar a atualizar os dados deste gênero!"});
    }

    return res.status(200).send({message: "Gênero atualizado com sucesso!"});
});

app.post("/genres", async (req,res) => {
    const {name} = req.body;

    if(!name) {
        return res.status(400).send({ message: "O nome do gênero é obrigatório." });
    }

    try {
        const genreAlreadyInDatabase = await prisma.genre.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: "insensitive"
                }
            }
        });

        if (genreAlreadyInDatabase) {
            return res.status(409).send({message: `O gênero ${name} já esta cadastrado na base de dados`});
        }

        await prisma.genre.create({
            data: {
                name: name
            }
        });

    } catch (error) {
        return res.status(500).send({message: "Falha ao tentar adicionar os dados deste gênero!"});
    }

    return res.status(200).send({message: "Gênero adicionado com sucesso!"});
});

app.get("/genres", async (_req,res) => {
    try {
        const allGenres = await prisma.genre.findMany({
            orderBy: {
                id: "asc"
            }
        });
        res.json(allGenres);

    } catch (error) {
        return res.status(500).send({message: "Ocorreu um erro ao buscar os dados dos filmes"});
    }
});

app.delete("/genres/:id", async (req, res) => {
    const genreId = Number(req.params.id);

    try {
        const genre = await prisma.genre.findUnique({
            where: {
                id: genreId,
            }
        });

        if(!genre){
            return res.status(404).send({message: "Gênero não encontrado"});
        }

        await prisma.genre.delete({
            where: {
                id: genreId
            }
        });
    } catch (error) {
        return res.status(500).send("Falha ao remover o gênero desejado");
    }

    res.status(200).send({message: "Gênero removido com sucesso." });
});


app.listen(port, () => {
    console.log("Servidor em execução");
});


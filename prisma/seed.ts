import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedDatabase() {
    try {
        //lista de idiomas//
        const languages = [
            { id: 1, name: "Português" },
            { id: 2, name: "Espanhol" },
            { id: 3, name: "Inglês" },
            { id: 4, name: "Japonês" },
            { id: 5, name: "Francês" },
        ];
        
        //adicionar lista de idiomas//
        for(const language of languages) {
            await prisma.language.create({
                data: {
                    id: language.id,
                    name: language.name
                }
            });
        }

        //lista de generos//
        const genres = [
            {
                id: 1,
                name: "Ação",
            },
            {
                id: 2,
                name: "Suspense",
            },
            {
                id: 3,
                name: "Aventura",
            },
            {
                id: 4,
                name: "Terror",
            },
            {
                id: 5,
                name: "Drama",
            },
            {
                id: 6,
                name: "Comédia",
            },
        ];

        //adicionar lista de generos//
        for (const genre of genres) {
            await prisma.genre.create({
                data: {
                    id: genre.id,
                    name: genre.name
                }
            });
        }


        //lista de filmes//
        const movies = [
            {
                title: "Rivais",
                genre_id: 1,
                language_id: 1,
                oscar_count: 0,
                release_date: "2024-06-23",
            },
            {
                title: "Napoleão",
                genre_id: 2,
                language_id: 2,
                oscar_count: 0,
                release_date: "2024-06-23",
            },
            {
                title: "Velozes e Furiosos 10",
                genre_id: 3,
                language_id: 5,
                oscar_count: 0,
                release_date: "2023-05-19",
            },
            {
                title: "Me Chame Pelo Seu Nome",
                genre_id: 4,
                language_id: 4,
                oscar_count: 0,
                release_date: "2017-11-24",
            },
            {
                title: "Shiva Baby",
                genre_id: 5,
                language_id: 1,
                oscar_count: 0,
                release_date: "2021-04-02",
            },
            {
                title: "Retrato de Uma Jovem em Chamas",
                genre_id: 6,
                language_id: 2,
                oscar_count: 0,
                release_date: "2019-09-18",
            },
            {
                title: "Black Widow",
                genre_id: 1,
                language_id: 3,
                oscar_count: 0,
                release_date: "2021-07-09",
            },
            {
                title: "Guardiões da Galáxia: Volume 3",
                genre_id: 3,
                language_id: 1,
                oscar_count: 0,
                release_date: "2023-01-01",
            },
            {
                title: "Homem-Aranha: Através do Aranhaverso",
                genre_id: 2,
                language_id: 1,
                oscar_count: 0,
                release_date: "2023-01-01",
            },
            {
                title: "Venom 3",
                genre_id: 3,
                language_id: 3,
                oscar_count: 0,
                release_date: "2024-01-01",
            },
        ];

        //adicionar lista de filmes//
        for(const movie of movies) {
            await prisma.movie.create({
                data: {
                    title: movie.title,
                    genre_id: movie.genre_id,
                    language_id: movie.language_id,
                    oscar_count: movie.oscar_count,
                    release_date: new Date(movie.release_date)
                }
            });
        }

        await prisma.$disconnect();

        console.log("Database preenchida com sucesso!");
    } catch (error) {
        console.error("Falha ao preencher a database: ", error);
    }
}

seedDatabase();

import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const moviesHomeController = async (_req: Request, res: Response) => {
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
                    duration: true,
                },
            }),
        ]);

        const averageDuration = averageDurationCall._avg.duration;

        const moviesResponse = {
            totalMovies,
            averageDuration,
            movies,
        };

        res.json(moviesResponse);
    } catch (error) {
        return res.status(500).send({ message: "Ocorreu um erro ao buscar os dados dos filmes" });
    }
};

export const moviesFilterController = async (req: Request, res: Response) => {
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

        if (movies.length === 0) {
            return res.status(404).send({ message: "Nenhum filme encontrado com esse critério de busca" });
        }

        res.json(movies);
    } catch (error) {
        return res.status(500).send({ message: "Ocorreu um erro ao tentar acessar essa listagem de filmes" });
    }
};

export const moviesCreateController = async (req: Request, res: Response) => {
    const { title, genre_id, language_id, oscar_count, release_date } = req.body;

    try {
        const movieWithSameTitle = await prisma.movie.findFirst({
            where: {
                title: { equals: title, mode: "insensitive" },
            },
        });

        if (movieWithSameTitle) {
            return res.status(409).send({ message: "Já existe um filme cadastrado com esse título" });
        }

        await prisma.movie.create({
            data: {
                title,
                genre_id,
                language_id,
                oscar_count,
                release_date: new Date(release_date),
            },
        });
    } catch (error) {
        return res.status(500).send({ message: "Falha ao cadastrar um filme" });
    }

    res.status(201).send({ message: "Filme cadastrado com sucesso" });
};

export const moviesUpdateController = async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    try {
        const movie = await prisma.movie.findUnique({
            where: {
                id,
            },
        });

        if (!movie) {
            return res.status(404).send({ message: "Filme não encontrado" });
        }

        const data = { ...req.body };
        data.release_date = data.release_date ? new Date(data.release_date) : undefined;

        await prisma.movie.update({
            where: {
                id,
            },
            data: data,
        });
    } catch (error) {
        return res.status(500).send({ message: "Falha ao atualizar o registro do filme" });
    }

    res.status(200).send("Filme atualizado com sucesso");
};

export const moviesDeleteController = async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    try {
        const movie = await prisma.movie.findUnique({
            where: {
                id,
            },
        });

        if (!movie) {
            return res.status(404).send({ message: "Filme não encontrado" });
        }

        await prisma.movie.delete({
            where: {
                id: id,
            },
        });
    } catch (error) {
        return res.status(500).send("Falha ao remover o registro");
    }

    res.status(200).send({ message: "Filme removido com sucesso" });
};

export const moviesByGenreController = async (req: Request, res: Response) => {
    const genreName = req.params.genreName;

    try {
        const genreExists = await prisma.genre.findFirst({
            where: {
                name: {
                    equals: genreName,
                    mode: "insensitive",
                },
            },
        });

        if (!genreExists) {
            return res.status(404).send({ message: "Este gênero não existe" });
        }

        const moviesFilteredByGenreName = await prisma.movie.findMany({
            include: {
                genres: true,
                languages: true,
            },
            where: {
                genres: {
                    name: {
                        equals: genreName,
                        mode: "insensitive",
                    },
                },
            },
        });

        res.status(200).send(moviesFilteredByGenreName);
    } catch (error) {
        return res.status(500).send({ message: "Falha ao filtrar filmes por gênero" });
    }
};

USE sf38_materiales;

INSERT INTO materiales (
    titulo, autor, tipo, descripcion, ubicacion, estado, fecha_adquisicion, activo
) VALUES
('La ciudad y los perros', 'Mario Vargas Llosa', 'libro', 'Obra titulada ''La ciudad y los perros'' escrita por Mario Vargas Llosa.', 'Estante B3', 'disponible', '2020-03-06', 1),
('Tradiciones Peruanas', 'Ricardo Palma', 'libro', 'Obra titulada ''Tradiciones Peruanas'' escrita por Ricardo Palma.', 'Estante F4', 'disponible', '2021-11-17', 1),
('El zorro de arriba y el zorro de abajo', 'José María Arguedas', 'libro', 'Obra titulada ''El zorro de arriba y el zorro de abajo'' escrita por José María Arguedas.', 'Estante G1', 'no disponible', '2021-01-25', 0),
('Los ríos profundos', 'José María Arguedas', 'libro', 'Obra titulada ''Los ríos profundos'' escrita por José María Arguedas.', 'Estante A5', 'disponible', '2023-06-17', 1),
('La palabra del mudo', 'Julio Ramón Ribeyro', 'libro', 'Obra titulada ''La palabra del mudo'' escrita por Julio Ramón Ribeyro.', 'Estante A2', 'no disponible', '2019-10-20', 0),
('Un mundo para Julius', 'Alfredo Bryce Echenique', 'libro', 'Obra titulada ''Un mundo para Julius'' escrita por Alfredo Bryce Echenique.', 'Estante A3', 'disponible', '2023-07-11', 1),
('La casa de cartón', 'Martín Adán', 'libro', 'Obra titulada ''La casa de cartón'' escrita por Martín Adán.', 'Estante I5', 'no disponible', '2023-03-19', 0),
('No me esperen en abril', 'Alfredo Bryce Echenique', 'libro', 'Obra titulada ''No me esperen en abril'' escrita por Alfredo Bryce Echenique.', 'Estante G2', 'disponible', '2021-05-18', 1),
('El pez de oro', 'Gamalyel de la Quintana', 'libro', 'Obra titulada ''El pez de oro'' escrita por Gamalyel de la Quintana.', 'Estante A2', 'disponible', '2020-12-08', 1),
('La agonía de Rasu Ñiti', 'José María Arguedas', 'libro', 'Obra titulada ''La agonía de Rasu Ñiti'' escrita por José María Arguedas.', 'Estante A2', 'no disponible', '2023-05-30', 0),
('Revista de Investigaciones Altoandinas', 'Varios autores', 'revista', 'Obra titulada ''Revista de Investigaciones Altoandinas'' escrita por Varios autores.', 'Estante C2', 'no disponible', '2022-01-15', 0),
('Revista Andina', 'Centro Bartolomé de Las Casas', 'revista', 'Obra titulada ''Revista Andina'' escrita por Centro Bartolomé de Las Casas.', 'Estante B4', 'disponible', '2020-12-03', 1),
('Revista del Archivo General de la Nación', 'AGN', 'revista', 'Obra titulada ''Revista del Archivo General de la Nación'' escrita por AGN.', 'Estante C1', 'disponible', '2020-01-06', 1),
('Revista de Derecho PUCP', 'PUCP', 'revista', 'Obra titulada ''Revista de Derecho PUCP'' escrita por PUCP.', 'Estante D5', 'disponible', '2021-12-17', 1),
('Revista Kawsaypacha', 'PUCP', 'revista', 'Obra titulada ''Revista Kawsaypacha'' escrita por PUCP.', 'Estante B3', 'disponible', '2020-12-14', 1),
('Apuntes', 'Universidad del Pacífico', 'revista', 'Obra titulada ''Apuntes'' escrita por Universidad del Pacífico.', 'Estante C3', 'disponible', '2023-07-12', 1),
('Debate Agrario', 'CEPES', 'revista', 'Obra titulada ''Debate Agrario'' escrita por CEPES.', 'Estante A3', 'no disponible', '2022-10-20', 0),
('Revista Peruana de Medicina Experimental y tituloSalud Pública', 'INS', 'revista', 'Obra titulada ''Revista Peruana de Medicina Experimental y Salud Pública'' escrita por INS.', 'Estante H3', 'disponible', '2024-01-26', 1),
('Anales de la Facultad de Medicina', 'UNMSM', 'revista', 'Obra titulada ''Anales de la Facultad de Medicina'' escrita por UNMSM.', 'Estante G1', 'disponible', '2023-10-01', 1),
('Revista del Instituto Riva-Agüero', 'PUCP', 'revista', 'Obra titulada ''Revista del Instituto Riva-Agüero'' escrita por PUCP.', 'Estante G3', 'no disponible', '2023-06-14', 0),
('Actas del Congreso Nacional de Historia', 'Instituto Nacional de Cultura', 'acta de congreso', 'Obra titulada ''Actas del Congreso Nacional de Historia'' escrita por Instituto Nacional de Cultura.', 'Estante C5', 'no disponible', '2024-01-02', 0),
('Actas del Congreso de Literatura Peruana', 'UNMSM', 'acta de congreso', 'Obra titulada ''Actas del Congreso de Literatura Peruana'' escrita por UNMSM.', 'Estante B5', 'disponible', '2021-06-01', 1),
('Actas del Congreso de Estudiantes de Medicina', 'SOCIMEP', 'acta de congreso', 'Obra titulada ''Actas del Congreso de Estudiantes de Medicina'' escrita por SOCIMEP.', 'Estante A1', 'disponible', '2022-12-28', 1),
('Memorias del Congreso de Ciencias Sociales', 'Universidad Nacional del Altiplano', 'acta de congreso', 'Obra titulada ''Memorias del Congreso de Ciencias Sociales'' escrita por Universidad Nacional del Altiplano.', 'Estante I3', 'disponible', '2024-02-26', 1),
('Actas del Congreso de Ingeniería Civil', 'CIP', 'acta de congreso', 'Obra titulada ''Actas del Congreso de Ingeniería Civil'' escrita por CIP.', 'Estante A2', 'no disponible', '2023-07-31', 0),
('Memorias del Congreso de Educación Intercultural', 'MINEDU', 'acta de congreso', 'Obra titulada ''Memorias del Congreso de Educación Intercultural'' escrita por MINEDU.', 'Estante I4', 'disponible', '2022-08-23', 1),
('Actas del Simposio de Arqueología Andina', 'Museo de Arqueología', 'acta de congreso', 'Obra titulada ''Actas del Simposio de Arqueología Andina'' escrita por Museo de Arqueología.', 'Estante I3', 'no disponible', '2022-08-27', 0),
('Congreso Internacional de Historia Regional', 'UNSA', 'acta de congreso', 'Obra titulada ''Congreso Internacional de Historia Regional'' escrita por UNSA.', 'Estante H5', 'no disponible', '2022-08-23', 0),
('Actas del Congreso de Bibliotecología', 'BNP', 'acta de congreso', 'Obra titulada ''Actas del Congreso de Bibliotecología'' escrita por BNP.', 'Estante B5', 'disponible', '2020-09-20', 1),
('Memorias del Encuentro Nacional de Archivos', 'AGN', 'acta de congreso', 'Obra titulada ''Memorias del Encuentro Nacional de Archivos'' escrita por AGN.', 'Estante B1', 'no disponible', '2020-11-30', 0),
('Revista Kawsaypacha', 'PUCP', 'revista', 'Obra titulada ''Revista Kawsaypacha'' escrita por PUCP.', 'Estante D3', 'disponible', '2020-06-30', 1),
('La ciudad y los perros', 'Mario Vargas Llosa', 'libro', 'Obra titulada ''La ciudad y los perros'' escrita por Mario Vargas Llosa.', 'Estante A1', 'disponible', '2020-03-20', 1),
('Tradiciones Peruanas', 'Ricardo Palma', 'libro', 'Obra titulada ''Tradiciones Peruanas'' escrita por Ricardo Palma.', 'Estante A2', 'no disponible', '2021-05-25', 0),
('El zorro de arriba y el zorro de abajo', 'José María Arguedas', 'libro', 'Obra titulada ''El zorro de arriba y el zorro de abajo'' escrita por José María Arguedas.', 'Estante C2', 'disponible', '2022-04-15', 1),
('La casa de cartón', 'Martín Adán', 'libro', 'Obra titulada ''La casa de cartón'' escrita por Martín Adán.', 'Estante E4', 'disponible', '2023-06-05', 1),
('Actas del Congreso Nacional de Historia', 'Instituto Nacional de Cultura', 'acta de congreso', 'Obra titulada ''Actas del Congreso Nacional de Historia'' escrita por Instituto Nacional de Cultura.', 'Estante F2', 'disponible', '2022-10-15', 1),
('Apuntes', 'Universidad del Pacífico', 'revista', 'Obra titulada ''Apuntes'' escrita por Universidad del Pacífico.', 'Estante D1', 'no disponible', '2023-02-01', 0),
('Un mundo para Julius', 'Alfredo Bryce Echenique', 'libro', 'Obra titulada ''Un mundo para Julius'' escrita por Alfredo Bryce Echenique.', 'Estante B1', 'disponible', '2022-03-08', 1),
('La palabra del mudo', 'Julio Ramón Ribeyro', 'libro', 'Obra titulada ''La palabra del mudo'' escrita por Julio Ramón Ribeyro.', 'Estante H1', 'disponible', '2021-09-25', 1),
('Actas del Congreso de Ingeniería Civil', 'CIP', 'acta de congreso', 'Obra titulada ''Actas del Congreso de Ingeniería Civil'' escrita por CIP.', 'Estante I2', 'no disponible', '2023-05-14', 0),
('Memorias del Congreso de Educación Intercultural', 'MINEDU', 'acta de congreso', 'Obra titulada ''Memorias del Congreso de Educación Intercultural'' escrita por MINEDU.', 'Estante F5', 'disponible', '2023-01-12', 1),
('Revista de Derecho PUCP', 'PUCP', 'revista', 'Obra titulada ''Revista de Derecho PUCP'' escrita por PUCP.', 'Estante G4', 'disponible', '2022-07-25', 1),
('El pez de oro', 'Gamalyel de la Quintana', 'libro', 'Obra titulada ''El pez de oro'' escrita por Gamalyel de la Quintana.', 'Estante H3', 'no disponible', '2021-04-09', 0),
('Debate Agrario', 'CEPES', 'revista', 'Obra titulada ''Debate Agrario'' escrita por CEPES.', 'Estante C4', 'disponible', '2023-11-28', 1),
('Actas del Congreso de Bibliotecología', 'BNP', 'acta de congreso', 'Obra titulada ''Actas del Congreso de Bibliotecología'' escrita por BNP.', 'Estante A4', 'disponible', '2022-05-14', 1),
('Tradiciones Peruanas', 'Ricardo Palma', 'libro', 'Obra titulada ''Tradiciones Peruanas'' escrita por Ricardo Palma.', 'Estante F2', 'no disponible', '2020-06-11', 0),
('Revista del Instituto Riva-Agüero', 'PUCP', 'revista', 'Obra titulada ''Revista del Instituto Riva-Agüero'' escrita por PUCP.', 'Estante H4', 'disponible', '2021-10-03', 1),
('Revista Peruana de Medicina Experimental y Salud Pública', 'INS', 'revista', 'Obra titulada ''Revista Peruana de Medicina Experimental y Salud Pública'' escrita por INS.', 'Estante I1', 'no disponible', '2020-08-24', 0),
('Revista del Archivo General de la Nación', 'AGN', 'revista', 'Obra titulada ''Revista del Archivo General de la Nación'' escrita por AGN.', 'Estante D4', 'disponible', '2022-02-28', 1),
('La casa de cartón', 'Martín Adán', 'libro', 'Obra titulada ''La casa de cartón'' escrita por Martín Adán.', 'Estante F1', 'no disponible', '2021-08-18', 0),
('Los ríos profundos', 'José María Arguedas', 'libro', 'Obra titulada ''Los ríos profundos'' escrita por José María Arguedas.', 'Estante C5', 'disponible', '2023-03-13', 1),
('Congreso Internacional de Historia Regional', 'UNSA', 'acta de congreso', 'Obra titulada ''Congreso Internacional de Historia Regional'' escrita por UNSA.', 'Estante H2', 'disponible', '2023-09-01', 1),
('Memorias del Encuentro Nacional de Archivos', 'AGN', 'acta de congreso', 'Obra titulada ''Memorias del Encuentro Nacional de Archivos'' escrita por AGN.', 'Estante G5', 'disponible', '2020-07-17', 1),
('Revista Andina', 'Centro Bartolomé de Las Casas', 'revista', 'Obra titulada ''Revista Andina'' escrita por Centro Bartolomé de Las Casas.', 'Estante E1', 'no disponible', '2023-04-10', 0),
('Apuntes', 'Universidad del Pacífico', 'revista', 'Obra titulada ''Apuntes'' escrita por Universidad del Pacífico.', 'Estante F3', 'disponible', '2023-12-02', 1),
('La agonía de Rasu Ñiti', 'José María Arguedas', 'libro', 'Obra titulada ''La agonía de Rasu Ñiti'' escrita por José María Arguedas.', 'Estante D2', 'disponible', '2022-06-18', 1),
('Actas del Congreso de Estudiantes de Medicina', 'SOCIMEP', 'acta de congreso', 'Obra titulada ''Actas del Congreso de Estudiantes de Medicina'' escrita por SOCIMEP.', 'Estante B2', 'disponible', '2020-09-05', 1),
('Actas del Congreso Nacional de Historia', 'Instituto Nacional de Cultura', 'acta de congreso', 'Obra titulada ''Actas del Congreso Nacional de Historia'' escrita por Instituto Nacional de Cultura.', 'Estante E2', 'no disponible', '2021-12-06', 0),
('La palabra del mudo', 'Julio Ramón Ribeyro', 'libro', 'Obra titulada ''La palabra del mudo'' escrita por Julio Ramón Ribeyro.', 'Estante A1', 'disponible', '2022-01-10', 1),
('Actas del Congreso de Literatura Peruana', 'UNMSM', 'acta de congreso', 'Obra titulada ''Actas del Congreso de Literatura Peruana'' escrita por UNMSM.', 'Estante E3', 'no disponible', '2023-07-08', 0),
('Un mundo para Julius', 'Alfredo Bryce Echenique', 'libro', 'Obra titulada ''Un mundo para Julius'' escrita por Alfredo Bryce Echenique.', 'Estante G2', 'disponible', '2022-09-19', 1),
('Actas del Congreso de Ingeniería Civil', 'CIP', 'acta de congreso', 'Obra titulada ''Actas del Congreso de Ingeniería Civil'' escrita por CIP.', 'Estante F3', 'disponible', '2022-03-04', 1),
('Revista de Investigaciones Altoandinas', 'Varios autores', 'revista', 'Obra titulada ''Revista de Investigaciones Altoandinas'' escrita por Varios autores.', 'Estante B3', 'no disponible', '2023-10-24', 0),
('No me esperen en abril', 'Alfredo Bryce Echenique', 'libro', 'Obra titulada ''No me esperen en abril'' escrita por Alfredo Bryce Echenique.', 'Estante I5', 'disponible', '2021-11-03', 1),
('El zorro de arriba y el zorro de abajo', 'José María Arguedas', 'libro', 'Obra titulada ''El zorro de arriba y el zorro de abajo'' escrita por José María Arguedas.', 'Estante D3', 'no disponible', '2023-08-06', 0);

UPDATE materiales SET cantidad = 32, total = 37 WHERE id = 1;
UPDATE materiales SET cantidad = 49, total = 56 WHERE id = 2;
UPDATE materiales SET cantidad = 42, total = 60 WHERE id = 3;
UPDATE materiales SET cantidad = 8, total = 16 WHERE id = 4;
UPDATE materiales SET cantidad = 17, total = 46 WHERE id = 5;
UPDATE materiales SET cantidad = 32, total = 38 WHERE id = 6;
UPDATE materiales SET cantidad = 38, total = 57 WHERE id = 7;
UPDATE materiales SET cantidad = 20, total = 52 WHERE id = 8;
UPDATE materiales SET cantidad = 35, total = 38 WHERE id = 9;
UPDATE materiales SET cantidad = 32, total = 43 WHERE id = 10;
UPDATE materiales SET cantidad = 48, total = 52 WHERE id = 11;
UPDATE materiales SET cantidad = 25, total = 30 WHERE id = 12;
UPDATE materiales SET cantidad = 43, total = 52 WHERE id = 13;
UPDATE materiales SET cantidad = 5, total = 44 WHERE id = 14;
UPDATE materiales SET cantidad = 8, total = 20 WHERE id = 15;
UPDATE materiales SET cantidad = 15, total = 37 WHERE id = 16;
UPDATE materiales SET cantidad = 1, total = 43 WHERE id = 17;
UPDATE materiales SET cantidad = 41, total = 52 WHERE id = 18;
UPDATE materiales SET cantidad = 31, total = 43 WHERE id = 19;
UPDATE materiales SET cantidad = 2, total = 23 WHERE id = 20;
UPDATE materiales SET cantidad = 37, total = 49 WHERE id = 21;
UPDATE materiales SET cantidad = 35, total = 52 WHERE id = 22;
UPDATE materiales SET cantidad = 3, total = 4 WHERE id = 23;
UPDATE materiales SET cantidad = 21, total = 51 WHERE id = 24;
UPDATE materiales SET cantidad = 36, total = 48 WHERE id = 25;
UPDATE materiales SET cantidad = 14, total = 42 WHERE id = 26;
UPDATE materiales SET cantidad = 31, total = 58 WHERE id = 27;
UPDATE materiales SET cantidad = 19, total = 20 WHERE id = 28;
UPDATE materiales SET cantidad = 33, total = 34 WHERE id = 29;
UPDATE materiales SET cantidad = 2, total = 18 WHERE id = 30;
UPDATE materiales SET cantidad = 19, total = 31 WHERE id = 31;
UPDATE materiales SET cantidad = 49, total = 51 WHERE id = 32;
UPDATE materiales SET cantidad = 3, total = 36 WHERE id = 33;
UPDATE materiales SET cantidad = 28, total = 40 WHERE id = 34;
UPDATE materiales SET cantidad = 47, total = 53 WHERE id = 35;
UPDATE materiales SET cantidad = 36, total = 55 WHERE id = 36;
UPDATE materiales SET cantidad = 14, total = 51 WHERE id = 37;
UPDATE materiales SET cantidad = 44, total = 49 WHERE id = 38;
UPDATE materiales SET cantidad = 1, total = 59 WHERE id = 39;
UPDATE materiales SET cantidad = 28, total = 54 WHERE id = 40;
UPDATE materiales SET cantidad = 8, total = 21 WHERE id = 41;
UPDATE materiales SET cantidad = 9, total = 50 WHERE id = 42;
UPDATE materiales SET cantidad = 43, total = 45 WHERE id = 43;
UPDATE materiales SET cantidad = 47, total = 51 WHERE id = 44;
UPDATE materiales SET cantidad = 41, total = 60 WHERE id = 45;
UPDATE materiales SET cantidad = 37, total = 59 WHERE id = 46;
UPDATE materiales SET cantidad = 1, total = 11 WHERE id = 47;
UPDATE materiales SET cantidad = 42, total = 56 WHERE id = 48;
UPDATE materiales SET cantidad = 20, total = 37 WHERE id = 49;
UPDATE materiales SET cantidad = 19, total = 24 WHERE id = 50;
UPDATE materiales SET cantidad = 35, total = 55 WHERE id = 51;
UPDATE materiales SET cantidad = 17, total = 21 WHERE id = 52;
UPDATE materiales SET cantidad = 36, total = 57 WHERE id = 53;
UPDATE materiales SET cantidad = 15, total = 60 WHERE id = 54;
UPDATE materiales SET cantidad = 28, total = 31 WHERE id = 55;
UPDATE materiales SET cantidad = 19, total = 49 WHERE id = 56;
UPDATE materiales SET cantidad = 28, total = 31 WHERE id = 57;
UPDATE materiales SET cantidad = 34, total = 40 WHERE id = 58;
UPDATE materiales SET cantidad = 9, total = 14 WHERE id = 59;
UPDATE materiales SET cantidad = 12, total = 59 WHERE id = 60;
UPDATE materiales SET cantidad = 34, total = 54 WHERE id = 61;
UPDATE materiales SET cantidad = 42, total = 46 WHERE id = 62;
UPDATE materiales SET cantidad = 4, total = 11 WHERE id = 63;
UPDATE materiales SET cantidad = 45, total = 51 WHERE id = 64;
UPDATE materiales SET cantidad = 24, total = 55 WHERE id = 65;

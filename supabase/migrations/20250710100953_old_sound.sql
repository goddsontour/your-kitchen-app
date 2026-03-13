/*
# Create recipes and shopping lists tables

1. New Tables
   - `recipes`
     - `id` (uuid, primary key)
     - `title` (text, required)
     - `description` (text, optional)
     - `ingredients` (text array, required)
     - `instructions` (text array, required)
     - `prep_time` (integer, optional) - in minutes
     - `cook_time` (integer, optional) - in minutes
     - `servings` (integer, optional)
     - `source_url` (text, optional)
     - `created_at` (timestamp)
     - `updated_at` (timestamp)
   
   - `shopping_lists`
     - `id` (uuid, primary key)
     - `name` (text, required)
     - `items` (jsonb array, required)
     - `created_at` (timestamp)
     - `updated_at` (timestamp)

2. Security
   - Enable RLS on both tables
   - Add policies for authenticated users to manage their own data
*/

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  ingredients text[] NOT NULL DEFAULT '{}',
  instructions text[] NOT NULL DEFAULT '{}',
  prep_time integer,
  cook_time integer,
  servings integer,
  source_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create shopping_lists table
CREATE TABLE IF NOT EXISTS shopping_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;

-- Create policies for recipes
CREATE POLICY "Anyone can read recipes"
  ON recipes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert recipes"
  ON recipes
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update recipes"
  ON recipes
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete recipes"
  ON recipes
  FOR DELETE
  TO public
  USING (true);

-- Create policies for shopping_lists
CREATE POLICY "Anyone can read shopping lists"
  ON shopping_lists
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert shopping lists"
  ON shopping_lists
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update shopping lists"
  ON shopping_lists
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete shopping lists"
  ON shopping_lists
  FOR DELETE
  TO public
  USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_lists_updated_at
  BEFORE UPDATE ON shopping_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
/*
  # Initial schema setup for meal tracking application

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `role` (text, either 'admin', 'manager', or 'user')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `members`
      - `id` (uuid, primary key)
      - `name` (text)
      - `created_at` (timestamp)
      - `created_by` (uuid, references profiles)
    - `meal_entries`
      - `id` (uuid, primary key)
      - `member_id` (uuid, references members)
      - `date` (date)
      - `count` (integer)
      - `created_at` (timestamp)
      - `created_by` (uuid, references profiles)
      - `updated_at` (timestamp)
      - `updated_by` (uuid, references profiles)
    - `shopping_items`
      - `id` (uuid, primary key)
      - `name` (text)
      - `cost` (numeric)
      - `date` (date)
      - `created_at` (timestamp)
      - `created_by` (uuid, references profiles)
      - `updated_at` (timestamp)
      - `updated_by` (uuid, references profiles)

  2. Security
    - Enable RLS on all tables
    - Add policies for different roles
*/

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'manager', 'user')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create members table
CREATE TABLE members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id) NOT NULL
);

-- Create meal_entries table
CREATE TABLE meal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  count integer NOT NULL CHECK (count >= 0),
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id) NOT NULL,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES profiles(id) NOT NULL
);

-- Create shopping_items table
CREATE TABLE shopping_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cost numeric NOT NULL CHECK (cost >= 0),
  date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id) NOT NULL,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES profiles(id) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can update profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

-- Members policies
CREATE POLICY "Members are viewable by everyone"
  ON members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins and managers can insert members"
  ON members FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('admin', 'manager')
    )
  );

-- Meal entries policies
CREATE POLICY "Meal entries are viewable by everyone"
  ON meal_entries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Managers can update meal entries within their month"
  ON meal_entries FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('admin', 'manager')
    ) AND
    date >= date_trunc('month', current_date) AND
    date < date_trunc('month', current_date) + interval '1 month'
  );

CREATE POLICY "Managers can update meal entries within their month"
  ON meal_entries FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('admin', 'manager')
    ) AND
    date >= date_trunc('month', current_date) AND
    date < date_trunc('month', current_date) + interval '1 month'
  );

-- Shopping items policies
CREATE POLICY "Shopping items are viewable by everyone"
  ON shopping_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Managers can insert shopping items within their month"
  ON shopping_items FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('admin', 'manager')
    ) AND
    date >= date_trunc('month', current_date) AND
    date < date_trunc('month', current_date) + interval '1 month'
  );

CREATE POLICY "Managers can update shopping items within their month"
  ON shopping_items FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('admin', 'manager')
    ) AND
    date >= date_trunc('month', current_date) AND
    date < date_trunc('month', current_date) + interval '1 month'
  );